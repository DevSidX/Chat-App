import { emitNewChatToParticipants } from "../lib/socket";
import { Chat } from "../models/chat.model";
import { Message } from "../models/message.model";
import { User } from "../models/user.model";
import { BadRequestException, NotFoundException } from "../utils/AppError";

const createChatService = async(userId: string, body: {
    participantId?: string,
    isGroup?: boolean,
    participants?: string[],
    groupName?: string
}) => {
    // what we gonna do is
    // check if the chat is group or not
    // if group then create a group chat with the provided participants and group name
    // if not group then check if the chat already exists between the two users
    // if exists then return the existing chat
    // if not exists then create a new chat between the two users
    const { participantId, isGroup, participants, groupName } = body

    let chat;
    let allParticipantsId: string[] = []

    if (isGroup && participants?.length && groupName) {
        allParticipantsId = [userId, ...participants]

        chat = await Chat.create({ // creating chat
            participants: allParticipantsId,
            isGroup: true,
            groupName,
            createdBy: userId 
        })
    } else if (participantId) {
        const anotherUser = await User.findById(participantId)

        if(!anotherUser){
            throw new NotFoundException("User not found")
        }

        allParticipantsId = [userId, participantId] // if another user present the include it into chat

        const existingChat = await Chat.findOne({
            participants: {
                $all: allParticipantsId,
                $size: 2
            }
        }).populate("participants", "name avatar") // check if chat already exists between two users
        // populate = fetching the details of participants (name and avatar) from User

        if(existingChat){
            return existingChat
        }
        // if not create a new chat
        chat = await Chat.create({
            participants: allParticipantsId,
            isGroup: false,
            createdBy: userId
        })
    }

    // Implement web socket 

    const populateChat = await chat?.populate("participants", "name avatar")
    const participantIdString = populateChat?.participants?.map((participant) => { 
        return participant._id?.toString()
    }) 

    emitNewChatToParticipants(participantIdString , populateChat) // emit the new chat to all the participants of the chat

    return chat
}

const getUserChatsService = async(userId: string) => {
    const chats = await Chat.find({
        participants: {
            $in: [userId]
        }
    }).populate("participants", "name avatar")  // get name and avatar of both the participants
    .populate({
        path: "lastMessage",
        populate: {
            path: "sender",
            select: "name avatar",
        },
        }
    ).sort({ updatedAt: -1 })

    return chats
}

const getSingleChatService = async( chatId: string, userId: string) => {
    const chat = await Chat.findOne({
        _id: chatId,
        participants: {
            $in: [userId]
        }
    })

    if (!chat) {
        throw new NotFoundException("Chat not found or you are not authorized to view this chat!")
    }

    const messages = await Message.find({ // find all the messages of this chat and populate the sender details (name and avatar) 
        chatId 
    }).populate("participants", "name avatar")
    .populate({
        path: "replyTo",
        select: "content image sender",
        populate: {
            path: "sender",
            select: "name avatar",
        },
    })
    .sort({ createdAt: 1 })

    return {
        chat,
        messages,
    }
}

const validateChatParticipants = async (chatId: string, userId: string) => {
    const chat = await Chat.findOne({
        _id: chatId,
        participants: {
            $in: [userId]
        }
    })

    if (!chat) {
        throw new BadRequestException("User not a participant in the chat")
    }
    return chat;
}
export { createChatService, getUserChatsService, getSingleChatService, validateChatParticipants }