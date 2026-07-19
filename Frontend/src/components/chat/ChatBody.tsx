import type { MessageType } from "@/@Types/chat.type"
import { useChat } from "@/hooks/useChat"
import { useSocket } from "@/hooks/useSocket"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import ChatMessageBody from "./ChatMessageBody"


interface Props {
  chatId: string | null
  messages: MessageType[]
  onReply: (message: MessageType) => void
  replyTo: MessageType | null
}

const ChatBody = ({ chatId, messages, onReply }: Props) => {
  const { socket } = useSocket()
  const { addNewMessage, addOrAutoUpdateMessage } = useChat()
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const [_, setAiChunk] = useState<string>("")


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



  useEffect(() => {
    if (!socket) return
    if (!chatId) return

    const handleAiStream = ({  // to handle the ai stream message from the server
      chatId: streamChatId,
      chunk,
      done,
      message,
    }: any) => {
      if (streamChatId !== chatId) {
        return
      }

      const streamingMsg = useChat.getState().singleChat?.messages.at(-1) // last message in the messages array

      if (streamingMsg?.streaming === false) { // streamingMsg?.streaming = true means the last message is still streaming
        return
      }

      if (chunk?.trim() && !done) {
        setAiChunk((prev) => {
          const newContent = prev + chunk
          addOrAutoUpdateMessage(
            chatId,
            { ...streamingMsg, content: newContent } as MessageType,
            streamingMsg?._id   // replaces lastMessage?._id
          )
          return newContent
        })
        return
      }

      if (done && message) {
        console.log("AI full message", message)
        addOrAutoUpdateMessage(
          chatId,
          { ...message, streaming: false },
          streamingMsg?._id
        )
        setAiChunk("")
      }
    }

    socket.on("chat: ai", handleAiStream) // listen for AI stream events

    return () => { // cleanup the socket event listener when the component unmounts or chatId changes
      socket.off("chat: ai", handleAiStream)
    }

  }, [socket, addOrAutoUpdateMessage, chatId])



  useLayoutEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "instant",
      block: "end",
    });
  }, [messages]); // removed replyTo

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