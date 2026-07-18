import { format, isToday, isYesterday, isThisWeek } from 'date-fns'
import type { chatType } from "@/@Types/chat.type";
import { useSocket } from "@/hooks/useSocket";
import { v4 as uuidv4 } from "uuid"

export const isUserOnline = (userId?: string) => {
    if(!userId){
        return false;
    }

    const { onlineUsers } = useSocket.getState()

    return onlineUsers.includes(userId)
}

// a helper that turns a chat object into the information needed to display that chat in the UI.
export const getOtherUserAndGroup = (chat: chatType, currUserId: string | null) => {
    const isGroup = chat?.isGroup

    if (isGroup) {  // if the chat is group
        return {
            name: chat.groupName || 'Unnamed Group',
            subHeading: `${chat.participants.length} member's `,
            avatar: "",
            isGroup
        }
    }

    const other = chat?.participants.find((participant) => (
        participant._id !== currUserId
    ))

    const isOnline = isUserOnline(other?._id ?? "") // if the user is online

    const subHeading = other?.isAI ? "Assistant" : isOnline ? "Online" : "Offline"

    console.log(subHeading, other, "subHeading and other")
    return {
        name: other?.name || "Unknown",
        subHeading,
        avatar: other?.avatar || "",
        isGroup: false,
        isOnline,
        isAI: other?.isAI || false
    }
}

export const formatChatTime = (date: string | Date) => {
    if(!date) return ""

    const newDate = new Date(date)

    if(isNaN(newDate.getTime())){
        return "Invalid Date"
    }

    if(isToday(newDate)){
        return format(newDate, "h:mm a")
    }

    if(isYesterday(newDate)){
        return "Yesterday"
    }

    if(isThisWeek(newDate)){
        return format(newDate, "EEEE")
    }

    return format(newDate, "M/d")
}

export function generateUUID(): string {
    return uuidv4()
}