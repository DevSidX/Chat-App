import { z } from "zod"
import type { MessageType } from "@/@Types/chat.type"
import React, { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "../ui/button"
import { Paperclip, Send, X } from "lucide-react"
import { Form, FormField, FormItem } from "../ui/form"
import ChatReplyBar from "./ChatReplyBar"
import { useChat } from "@/hooks/useChat"

interface Props {
  chatId: string | null
  currUserId: string | null
  replyToId: MessageType | null
  onCancelReply: () => void
  isAIChat: boolean
}

const ChatFooter = ({ chatId, currUserId, isAIChat, replyToId, onCancelReply }: Props) => {

  // shape of the data here it expects a message string
  const messageSchema = z.object({
    message: z.string().optional()
  })

  const { sendMessage, isSendingMessage } = useChat() // isSendigMessage here is used to disable the send button when the message is being sent 

  const [image, setImage] = useState<string | null>(null)
  const imageImputRef = useRef<HTMLInputElement | null>(null)

  // manages the form state, validation and submission
  const form = useForm({
    resolver: zodResolver(messageSchema),
    defaultValues: { // initial value for the message field
      message: "",
    }
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] // extract the file from the UI
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    const reader = new FileReader() // browser file reader
    reader.onloadend = () => { // runs after the file is fully read
      setImage(reader.result as string)
    }
    reader.readAsDataURL(file) // used for Instant Image Preview
  }

  const handleRemoveImage = () => {
    setImage(null)
    if (imageImputRef.current) {  // if the reference is currenty attached to an element
      imageImputRef.current.value = ""
    }
  }

  const onSubmit = (values: { message?: string }) => {
    if (isSendingMessage) {
      return
    }

    if (!values.message?.trim() && !image) { //  if the value is not an image or an string
      toast.error("Please enter a message or select an image")
      return
    }

    const payload = {
      chatId,
      content: values.message,
      image: image || undefined,
      replyToId: replyToId
    }

    // send message
    sendMessage(payload, isAIChat)

    onCancelReply()
    handleRemoveImage()
    form.reset()
  }

  return (
    <>
      <div className="sticky bottom-0 inset-x-0 z-[999] bg-card border-t border-border py-8">

        {replyToId && (
          <div className="max-w-6xl mx-auto px-8.5 mb-2">
            <ChatReplyBar
              replyTo={replyToId}
              currUserId={currUserId}
              onCancel={onCancelReply}
            />
          </div>
        )}
        {image && !isSendingMessage && (
          <div className="max-w-6xl max-auto px-8.5 mb-2">
            <div className="relative w-fit">
              <img
                src={image}
                className="object-contain h-16 bg-muted min-w-16"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-px right-1 bg-black/50 text-white rounded-full cursor-pointer"
                onClick={handleRemoveImage}
              >
                <X className="h-3 w-3"></X>
              </Button>
            </div>
          </div>
        )}

        <Form {...form}> {/*form has default values*/}
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="max-w-6xl px-8.5 mx-auto flex items-end gap-2"
          >
            <div className="flex items-center gap-1.5">

              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={isSendingMessage}
                className="rounded-full"
                onClick={() => imageImputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                disabled={isSendingMessage}
                ref={imageImputRef}
                onChange={handleImageChange}
              />

            </div>

            <FormField
              control={form.control}
              name="message"
              disabled={isSendingMessage}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <input
                    {...field}
                    autoComplete="off"
                    placeholder="Type a new message"
                    className="min-h-[40px] bg-background"
                  />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              size="icon"
              className="rounded-lg"
              disabled={isSendingMessage}
            >
              <Send className="h-3.5 w-3.5" />
            </Button>

          </form>
        </Form>
        
      </div>

      {replyToId && !isSendingMessage && (
        <ChatReplyBar
          replyTo={replyToId}
          currUserId={currUserId}
          onCancel={onCancelReply}
        />
      )}

    </>
  )
}

export default ChatFooter