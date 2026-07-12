import mongoose from "mongoose"
import { cloudinary } from "../config/cloudinary.config"
import { Chat } from "../models/chat.model"
import { Message } from "../models/message.model"
import { BadRequestException, NotFoundException } from "../utils/AppError"
import { emitChatAI, emitLastMessageToParticipants, emitNewMessageToChatRoom } from "../lib/socket"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { Env } from "../config/env.config"
import { User } from "../models/user.model"
import { ModelMessage, streamText } from "ai"

const google = createGoogleGenerativeAI({
    apiKey: Env.GOOGLE_GEMINI_API
})

const sendMessageService = async (
    userId: string, 
    body: {
        chatId: string,
        content?: string,
        image?: string,
        replyToId?: string
    }
) => {
    // Check if the chat exists and the user is a participant of the chat
    // then create a new message in the chat
    // If the message is a reply to another message then check if the message being replied to exists and belongs to the same chat
    // If the message is a reply to another message and the message being replied to exists and belongs to the same chat then create a new message with the replyTo field set to the id of the message being replied to
    // If the message is not a reply to another message then create a new message without the replyTo field
    // After creating the message update the lastMessage field of the chat with the content of the new message and the timestamp of
    const { chatId, content, image, replyToId } = body

    console.log("replyToId:", replyToId);

    const chat = await Chat.findOne({
        _id: chatId,
        participants: {
            $in: [userId] // Check if the user(sender) is a participant of the chat
        }
    })

    if(!chat) {
        throw new BadRequestException("Chat not found or unauthorized")
    }

    if (replyToId) {
        const replyMsg = await Message.findOne({
            _id: replyToId,
            chatId
        })

        if(!replyMsg){
            throw new NotFoundException("Reply message not found");
        }
    }

    let imageUrl;

    if(image){
        // upload the image from cloudinary
        const upload = await cloudinary.uploader.upload(image) 
        imageUrl = upload.secure_url // secure_url is the url of the uploaded image that we can use to display the image in the frontend
    }

    const newMsg = await Message.create({
        chatId,
        sender: userId,
        content,
        image: imageUrl,
        replyTo: replyToId || undefined,  // null
    })

    await newMsg.populate([
        {
            path: "sender",
            select: "avatar"
        },
        {
            path: "replyTo",
            select: "content image sender",
            populate: {
                path: "sender",
                select: "name avatar"
            },
        },
    ])

    chat.lastMessage = newMsg._id as mongoose.Types.ObjectId

    await chat.save() // with the updated lastMessage field

    // websocket emit the new message to the chat members
    emitNewMessageToChatRoom(userId, chatId, newMsg)

    // webSocket emit the last message to the chat members (personal room user)
    const allParticipantsIds = chat.participants.map(participant => participant.toString()) // get all the participant ids of the chat as strings
    emitLastMessageToParticipants(allParticipantsIds, chatId, newMsg) 

    let aiResponse: any = null

    if(chat.isAiChat){
        aiResponse = await getAIResponse(chatId, userId)

        if(aiResponse){
            chat.lastMessage = aiResponse._id as mongoose.Types.ObjectId
            await chat.save();
        }
    }

    return {
        msg: newMsg,
        aiResponse,
        chat,
        isAiChat: chat.isAiChat
    }
    
}

// Function to get AI response for a chat and user. 
async function getAIResponse(chatId: string, userId: string){
    const TalkAi = await User.findOne({
        isAi: true
    })

    if(!TalkAi){
        throw new NotFoundException("AI user not found");
    }

    const chatHistory = await getChatHistory(chatId)

    // ModelMessage is the fundamental structure used to send prompts to an AI
    const formattedMessages: ModelMessage[] = chatHistory.map(( message: any ) => {
        const role = message.sender.isAI ? "assistant" : "user"
        const parts: any[] = [];

        if(message.image){
            parts.push({
                type: "file",
                data: message.image,
                mediaType: "image/png",
                filename: "image.png"
            })
            if(!message.content){
                parts.push({
                    type: "text",
                    text: "Describe what you see in the image"
                })
            }
        }

        if(message.content){
            parts.push({
                type: "text",
                text: message.replyTo ? 
                    `Replying to: ${message.replyTo.content}\n${message.content}` :
                     message.content
            })
        }
        return {
            role,
            content: parts,

        }
    })

    const result = streamText({ // await
        model: google("gemini-2.5-flash"),
        messages: formattedMessages,
        system: "You are a helpful AI assistant so respond only with text and attend to the last user message only.",
    })

    let fullResponse = "";
    for await(let chunk of result.textStream) {
        emitChatAI({
            chatId,
            chunk,
            sender: TalkAi,
            done: false,
            message: null
        })
        fullResponse += chunk
    }

    if(!fullResponse.trim()) {
        return ""
    }

    const aiMessage = await Message.create({
        chatId,
        sender: TalkAi._id,
        content: fullResponse
    })

    await aiMessage.populate("sender", "name avatar isAI")

    // emit ai fullResponse message 
    emitChatAI({
        chatId,
        chunk: null,
        sender: TalkAi,
        done: false,
        message: aiMessage
    })

    emitLastMessageToParticipants([userId], chatId, aiMessage)
}

async function getChatHistory(chatId: string){
    const messages = await Message.find({
        chatId
    })
    .populate("sender", "isAI")
    .populate("replyTo", "content")
    .sort({ createdAt: -1})
    .limit(5)
    .lean()

    return messages.reverse() // reverse the messages to get the correct order of the chat history
}


export { sendMessageService }