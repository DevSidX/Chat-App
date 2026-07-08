import type { MessageType } from "@/@Types/chat.type"
import { useChat } from "@/hooks/useChat"
import { useSocket } from "@/hooks/useSocket"
import { useEffect, useLayoutEffect, useRef } from "react"
import ChatMessageBody from "./ChatMessageBody"


interface Props {
  chatId: string | null
  messages: MessageType[]
  onReply: (message: MessageType) => void
  replyTo: MessageType | null
}

const ChatBody = ({ chatId, messages, onReply, replyTo }: Props) => {
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
  }, [socket, addNewMessage, chatId])

  useLayoutEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "instant",
      block: "end",
    });
  }, [messages, replyTo]);

  return (
    <div className="w-full max-w-6xl mx-auto h-full flex flex-col px-3 pt-36">
      {messages.filter((message): message is MessageType => Boolean(message?._id)).map((message) => (
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