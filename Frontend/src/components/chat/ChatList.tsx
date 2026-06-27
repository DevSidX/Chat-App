import { useChat } from "@/hooks/useChat"
import { useEffect, useState } from "react"
import { Spinner } from "../ui/spinner"
import ChatListItem from "./ChatListItem"
import { data, useNavigate } from "react-router-dom"
import useAuth from "@/hooks/useAuth"
import ChatListHeader from "./ChatListHeader"
import type { chatType, MessageType } from "@/@Types/chat.type"
import { useSocket } from "@/hooks/useSocket"

const chatList = () => {

    const navigate = useNavigate()

    const { socket } = useSocket()

    const { fetchChats, chats, isChatLoading, addNewChat, updateChatLastMessage } = useChat()

    const [searchQuery, setSearchQuery] = useState("")

    const { user } = useAuth()
    const currentUserId = user?._id || null

    // Creates a new array containing only chats that match the search criteria
    const filteredChats = chats?.filter((chat) => (
        chat.groupName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.participants?.some((participant) => (
            participant._id !== currentUserId &&
            participant.name?.toLowerCase().includes(searchQuery.toLowerCase())
        ))
    )) || []

    useEffect(() => { // run the fetch method as soon as the component loads on the screen
        fetchChats()
    }, [fetchChats])

    useEffect(() => {
        if (!socket) {
            return
        }

        const handleNewChat = (newChat: chatType) => {
            console.log("Received new chat");
            addNewChat(newChat)
        }

        socket.on("chat: new", handleNewChat)

        return () => {
            socket.off("chat: new", handleNewChat)
        }
    }, [addNewChat, socket])

    // runs whenevr the last message gets updated
    useEffect(() => {
        if (!socket) {
            return
        }

        const handleChatUpdate = (data: {
            chatId: string,
            lastMessage: MessageType
        }) => {
            console.log("Received new chat", data.lastMessage)

            updateChatLastMessage(data.chatId, data.lastMessage)
        }

        socket.on("chat: update", handleChatUpdate)

        return () => {
            socket.off("chat: update", handleChatUpdate)
        }
    }, [socket, updateChatLastMessage])

    const onRoute = (id: string) => {
        navigate(`/chat/${id}`)
    }

    return (
        <div className="fixed inset-y-0 * pb-20  lg:pb-0 lg:max-w-[379px] lg:block border-r border-border bg-sidebar max-w-[calc(100%-40px)] w-full left-10 z-[98]">
            <div className="flex-col">
                <ChatListHeader
                    onSearch={setSearchQuery}
                />
                <div className="flex-1 h-[calc(100vh-100px)] overflow-y-auto">
                    <div className="px-2 pb-10 pt-1 space-y-1">
                        {isChatLoading ?
                            (
                                <div className="flex items-center justify-center">
                                    <Spinner className="w-7 h-7" />
                                </div>
                            ) : (
                                filteredChats?.length === 0 ?
                                    (
                                        <div className="flex items-center justify-center">
                                            {searchQuery ? "No chat found" : "No chats created"}
                                        </div>
                                    ) : (
                                        filteredChats?.map((chat) => (
                                            <ChatListItem
                                                key={chat._id}
                                                chat={chat}
                                                currentUserId={currentUserId}
                                                onClick={() => onRoute(chat._id)}
                                            />
                                        ))
                                    )
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default chatList