import type { UserType } from "@/@Types/auth.type";
import type { chatType, createChatType, MessageType, createMessageType } from "@/@Types/chat.type";
import { API } from "@/lib/axiosClient";
import { toast } from "sonner";
import { create } from "zustand";
import useAuth from "./useAuth";
import { generateUUID } from "@/lib/helper";

interface chatState {
    chats: chatType[]
    users: UserType[]
    singleChat: {
        chat: chatType,
        messages: MessageType[]
    } | null

    isChatLoading: boolean
    isUserLoading: boolean
    isCreatingChat: boolean
    isSingleChatLoading: boolean
    isSendingMessage: boolean

    // functions types
    fetchAllUsers: () => void
    fetchChats: () => void
    createChat: (payload: createChatType) => Promise<chatType | null>
    fetchSingleChat: (chatId: string) => void
    sendMessage: (payload: createMessageType, isAIChat?: boolean) => void

    addNewChat: (newChat: chatType) => void

    updateChatLastMessage: (chatId: string, lastMessage: MessageType) => void

    addNewMessage: (chatId: string, message: MessageType, tempId?: string) => void

    addOrAutoUpdateMessage: (
        chatId: string,
        message: MessageType,
        tempId?: string
    ) => void
}

const useChat = create<chatState>()(
    (set, get) => ({
        chats: [],
        users: [],
        singleChat: null,

        isChatLoading: false,
        isUserLoading: false,
        isCreatingChat: false,
        isSingleChatLoading: false,
        isSendingMessage: false, 

        fetchAllUsers: async () => {
            set({ isUserLoading: true })

            try {
                const { data } = await API.get('/user/all');
                set({ users: data.users })
            } catch (error: any) {
                toast.error(error?.response?.data?.message || "Failed to fetch users")
            } finally {
                set({ isUserLoading: false })
            }
        },

        fetchChats: async () => {
            set({ isChatLoading: true })

            try {
                const { data } = await API.get('/chat/all');
                set({ chats: data.chats })
            } catch (error: any) {
                toast.error(error?.response?.data?.message || "Failed to fetch chats")
            } finally {
                set({ isChatLoading: false })
            }
        },

        createChat: async (payload: createChatType) => {
            set({ isCreatingChat: true })

            try {
                const response = await API.post('/chat/create', { ...payload });

                get().addNewChat(response.data.chat)
                toast.success("Chat created successfully")

                return response.data.chat

            } catch (error: any) {
                toast.error(error?.response?.data?.message || "Failed to create chat")
                return null
            } finally {
                set({ isCreatingChat: false })
            }
        },

        fetchSingleChat: async (chatId: string) => {
            set({ isSingleChatLoading: true })

            try {
                const { data } = await API.get(`/chat/${chatId}`);
               set({ singleChat: data })
            } catch (error: any) {
                toast.error(error?.response?.data?.message || "Failed to fetch chat")
            } finally {
                set({ isSingleChatLoading: false })
            }
        },

        // add a chat to the top of a list/all the chats 
        addNewChat: (newChat: chatType) => {
            set((state) => {
                const existingChat = state.chats.findIndex(
                    (chat) => chat._id === newChat._id
                ) // check if the newchat is already created

                if (existingChat !== -1) { // existingchat was found somewhere inside the list 
                    // move the chat to the top
                    return {
                        chats: [newChat, ...state.chats.filter((chat) =>  /* chats = list of chats */
                            chat._id !== newChat._id // newChat._id is existing chat Id somewhere in the lists of chat
                        )]
                    }
                } else {
                    return {
                        chats: [newChat, ...state.chats] // create the new chat
                    }
                }
            })
        },

        /* 
            finds the chat by chatId
            updates its lastMessage
            moves that chat to the top of chats
        */
        updateChatLastMessage: (chatId, lastMessage) => {
            set((state) => {
                const chat = state.chats.find((chat) => chat._id === chatId)

                if (!chat) {
                    return state
                }

                return {
                    chats: [
                        { ...chat, lastMessage },
                        ...state.chats.filter((chat) => chat._id !== chatId)
                    ]
                }
            })
        },

        addNewMessage: (chatId, message) => {
            const chat = get().singleChat

            if (chat?.chat._id === chatId) {
                set({ 
                    singleChat: {
                        chat: chat.chat,
                        messages: [...chat.messages, message] 
                    }
                })
            }
        },

        sendMessage: async (payload: createMessageType, isAIChat?: boolean) => {
            // purpose of this sendMessage function is to send a message to the server and update the UI with the new message
            // 1. get the current user (sender of the message) from the auth store
            // 2. get the current chat from the chat store
            // 3. create a temporary message object to show in the UI while the actual message is being sent to the server
            // 4. send the message to the server
            // 5. update the singleChat state with the new message
            // 6. if the current chat is not the same as the chatId of the message being sent, do nothing
            // 7. if the message is sent successfully, update the singleChat state with the new message

            set({ isSendingMessage: true })
            const { chatId, content, image, replyToId } = payload
            const { user } = useAuth.getState() // get the current user (sender of the message) 
            const chat = get().singleChat?.chat // get the current chat from the chat store
            const aiSender = chat?.participants.find((participant) => ( // find the AI sender in the chat participants
                participant.isAI
            ))

            if(!chatId || !user?._id) {
                return
            }

            const tempUserId = generateUUID()
            const tempAIId = generateUUID()
            
            const tempMessage: MessageType = {  // purpose = to create a temporary message object to show in the UI while the actual message is being sent to the server 
                _id: tempUserId,
                chatId,
                content: content || "",
                image: image || null,
                sender: user,
                replyTo: replyToId || null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                status: !isAIChat ? "sending..." : ""
            }
            get().addNewMessage(chatId, tempMessage, tempUserId) // add the temporary message to the singleChat state

            if (isAIChat && aiSender) {
                const tempAIMessage = {
                    _id: tempAIId,
                    chatId,
                    content: "",
                    image: null,
                    sender: aiSender,
                    replyTo: null,
                    streaming: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                }
                get().addNewMessage(chatId, tempAIMessage, tempAIId)
            }

            // set((state) => {
            //     if(state.singleChat?.chat._id !== chatId){ // if the current chat is not the same as the chatId of the message being sent, do nothing
            //         return state
            //     }
            //     return { // update the singleChat state with the new message
            //         singleChat: {
            //             ...state.singleChat,
            //             messages: [...state.singleChat.messages, tempMessage]
            //         }
            //     }
            // })

            try {
                const { data } = await API.post('/chat/message/send', {
                chatId,
                content,
                image,
                replyToId: replyToId?._id
            })
    
            const { msg: userMessage } = data

            // replace the temporary message with the actual message from the server
            get().addOrAutoUpdateMessage(chatId, userMessage, tempUserId)

            } catch (error: any) {
                toast.error(error?.response?.data?.message || "Failed to send message")   
            } finally {
                set({ isSendingMessage: false })
                
            }
        },

        addOrAutoUpdateMessage: async (chatId: string, message: MessageType, tempId?: string) => {
            if (!message) return 
            const singleChat = get().singleChat

            // if the current chat is not the same as the chatId of the message being sent, do nothing
            if (!singleChat || singleChat.chat._id !== chatId) {
                return  
            }

            const messages = singleChat.messages

            const messageIndex = tempId ? messages.findIndex((message) => (
                message._id === tempId
            )) : -1

            let updatedMessages;

            if (messageIndex !== -1) {
                updatedMessages = messages.map((msg, Index) => {
                    if (Index === messageIndex) {
                        return message
                    }
                    return msg
                })
            } else {
                updatedMessages = [...messages, message] // add the new message to the end of the messages array
            }
        
            set({
                singleChat: {
                    chat: singleChat.chat,
                    messages: updatedMessages,
                }
            })
        }

    })
)

export { useChat }