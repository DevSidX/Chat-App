import { format, isToday, isYesterday, isThisWeek } from 'date-fns'
import type { chatType } from "@/@Types/chat.type";
import { useSocket } from "@/hooks/useSocket";


export const isUserOnline = (userId?: string) => {
    if(!userId){
        return false;
    }

    const { onlineUsers } = useSocket.getState()

    return onlineUsers.includes(userId)
}


export const getOtherUserAndGroup = (chat: chatType, currUserId: string | null) => {
    const isGroup = chat?.isGroup

    if (isGroup) {
        return {
            name: chat.groupName || 'Unnamed Group',
            subHeading: `{chat.participants.length} member's `,
            avatar: "",
            isGroup
        }
    }

    const other = chat?.participants.find((participant) => (
        participant._id !== currUserId
    ))

    const isOnline = isUserOnline(other?._id ?? "") // if the user is online

    return {
        name: other?.name || "Unknown",
        subHeading: isOnline ? "Online" : "Offline",
        avatar: other?.avatar || "",
        isGroup: false,
        isOnline
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