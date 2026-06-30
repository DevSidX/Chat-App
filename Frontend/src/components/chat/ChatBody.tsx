import type { MessageType } from "@/@Types/chat.type"
import { useChat } from "@/hooks/useChat"
import { useSocket } from "@/hooks/useSocket"
import { useEffect, useRef } from "react"
import ChatMessageBody from "./ChatMessageBody"


interface Props {
  chatId: string | null
  messages: MessageType[]
  onReply: (message: MessageType) => void
}

const ChatBody = ({ chatId, messages, onReply }: Props) => {
  const { socket } = useSocket()
  const { addNewMessage } = useChat()
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!chatId) {
      return
    }
    if (!socket) {
      return
    }
    const handleNewMessage = (message: MessageType) => { // when the new message arrives
      addNewMessage(chatId, message)
    }
    socket.on("message: new", handleNewMessage)

    return () => {
      socket.off("message: new", handleNewMessage)
    }
  }, [socket, addNewMessage])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="w-full max-w-6xl mx-auto h-full flex flex-col px-3 pt-36">
      {messages?.map((message) => (
        <ChatMessageBody
          key={message._id}
          message={message}
          onReply={onReply}
        />
      ))}
      <div ref={bottomRef}></div>

    </div>
  )
}

export default ChatBody