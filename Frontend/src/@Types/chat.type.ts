import type { UserType } from "./auth.type"

export type chatType = {
    _id: string
    lastMessage: MessageType
    participants: UserType[]
    isGroup: boolean
    createdBy: string
    groupName: string
    createdAt: string 
    updatedAt: string 
}

export type MessageType = {
    _id: string
    content: string | null
    image: string | null
    sender: UserType | null
    replyTo: MessageType | null
    charId: string 
    createdAt: string
    updatedAt: string
    // only frontend
    status?: string
}

export type createChatType = {
    participantId?: string
    isGroup?: boolean
    participants?: string[]
    groupName?: string
}

export type createMessageType = {
    chatId: string
    content?: string
    image?: string
    replyTo?: MessageType | null
}