import type { MessageType } from "@/@Types/chat.type"
import ChatBody from "@/components/chat/ChatBody"
import ChatFooter from "@/components/chat/ChatFooter"
import ChatHeader from "@/components/chat/ChatHeader"
import EmptyState from "@/components/emptyState"
import { Spinner } from "@/components/ui/spinner"
import useAuth from "@/hooks/useAuth"
import { useChat } from "@/hooks/useChat"
import useChatId from "@/hooks/useChatId"
import { useSocket } from "@/hooks/useSocket"
import { useEffect, useState } from "react"

const SingleChat = () => {

  const chatId = useChatId()
  const { fetchSingleChat, singleChat, isSingleChatLoading } = useChat()
  const { socket } = useSocket()
  const { user } = useAuth()

  const [replyto, setReplyTo] = useState<MessageType | null>(null)

  const currUserId = user?._id || null
  const chat = singleChat?.chat
  const messages = singleChat?.messages || []
  const isAIChat = chat?.isAiChat || false

  useEffect(() => { // fetch the sinle chat of a user on the right side
    if (!chatId) return;
    fetchSingleChat(chatId)
  }, [fetchSingleChat, chatId])

  // socket chat room 
  useEffect(() => {
    if (!chatId || !socket) return;
    socket?.emit("chat: join", chatId)

    return () => {
      socket?.emit("chat: leave", chatId)
    }
  }, [chatId, socket])

  if (isSingleChatLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner className="w-11 h-11 !text-primary" />
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-lg">Chat not found</p>
      </div>
    );
  }

  return (
    <div className="relative h-svh flex flex-col">
      <ChatHeader chat={chat} currentUserId={currUserId} />

      <div className="flex-1 min-h-0 overflow-y-auto bg-background">
        {messages.length === 0 ? (
          <EmptyState
            title="Start a conversation"
            description="No messages yet. Send the first message"
          />
        ) : (
          <ChatBody
            chatId={chatId}
            messages={messages}
            onReply={setReplyTo}
            replyTo={replyto}
          />
        )}
      </div>

      <ChatFooter
        replyToId={replyto}
        chatId={chatId}
        isAIChat={isAIChat}
        currUserId={currUserId}
        onCancelReply={() => setReplyTo(null)}
      />
    </div>
  )
}

export default SingleChat