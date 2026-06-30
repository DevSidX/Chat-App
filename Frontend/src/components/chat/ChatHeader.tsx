import type { chatType } from "@/@Types/chat.type"
import { getOtherUserAndGroup } from "@/lib/helper"
import { PROTECTED_ROUTE } from "@/routes/routes"
import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import AvatarWithBatch from "../avatarWithBatch"

interface Props {
    chat: chatType
    currentUserId: string | null
}

const ChatHeader = ({ chat, currentUserId }: Props) => {
    const navigate = useNavigate()

    const { name, subHeading, avatar, isOnline, isGroup } = getOtherUserAndGroup(chat, currentUserId)

    console.log(chat, "chat")
    return (
        <div className="sticky top-0 flex items-center gap-5 border-b border-border bg-card px-2 z-50">
            
            <div className="h-14 px-4 flex items-center">
                <div className="">
                    <ArrowLeft
                        className="w-5 h-5 inline-block lg:hidden text-muted-foreground cursor-pointer mr-2"
                        onClick={() => navigate(PROTECTED_ROUTE.CHAT)}
                    />
                </div>
                <AvatarWithBatch
                    name={name}
                    src={avatar}
                    isGroup={isGroup}
                    isOnline={isOnline}
                />
                <div className="ml-2">
                    <div className="font-semibold">{name}</div>
                    <p className={`text-sm  ${isOnline ? "text-green-500" : "text-muted-foreground"}`}>
                        {subHeading}
                    </p>
                </div>
            </div>

            <div className={`flex-1 text-center py-4 h-full border-b-2 border-primary font-medium text-primary`}>
                Chat
            </div>
            
        </div>
    )
}

export default ChatHeader