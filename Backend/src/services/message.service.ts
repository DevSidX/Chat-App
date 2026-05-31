import mongoose from "mongoose"
import { cloudinary } from "../config/cloudinary.config"
import { Chat } from "../models/chat.model"
import { Message } from "../models/message.model"
import { BadRequestException, NotFoundException } from "../utils/AppError"
import { emitLastMessageToParticipants, emitNewMessageToChatRoom } from "../lib/socket"


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

    return {
        msg: newMsg,
        chatId
    }
    
}

export { sendMessageService }