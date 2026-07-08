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
        message: MessageType[]
    } | null

    isChatLoading: boolean
    isUserLoading: boolean
    isCreatingChat: boolean
    isSingleChatLoading: boolean

    // functions types
    fetchAllUsers: () => void
    fetchChats: () => void
    createChat: (payload: createChatType) => Promise<chatType | null>
    fetchSingleChat: (chatId: string) => void
    sendMessage: (payload: createMessageType) => void

    addNewChat: (newChat: chatType) => void

    updateChatLastMessage: (chatId: string, lastMessage: MessageType) => void

    addNewMessage: (chatId: string, message: MessageType) => void
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
               set({ singleChat: { chat: data.chat, message: data.messages } })
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
                        message: [...chat.message, message] 
                    }
                })
            }
        },

        sendMessage: async (payload: createMessageType) => {
            // purpose of this sendMessage function is to send a message to the server and update the UI with the new message
            // 1. get the current user (sender of the message) from the auth store
            // 2. get the current chat from the chat store
            // 3. create a temporary message object to show in the UI while the actual message is being sent to the server
            // 4. send the message to the server
            // 5. update the singleChat state with the new message
            // 6. if the current chat is not the same as the chatId of the message being sent, do nothing
            // 7. if the message is sent successfully, update the singleChat state with the new message
            const { chatId, content, image, replyToId } = payload
            const { user } = useAuth.getState() // get the current user (sender of the message) 

            if(!chatId || !user?._id) {
                return
            }

            const tempMessageId = generateUUID()
            const tempMessage: MessageType = {  // purpose = to create a temporary message object to show in the UI while the actual message is being sent to the server 
                _id: tempMessageId,
                chatId,
                content: content || "",
                image: image || null,
                sender: user,
                replyTo: replyToId || null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                status: "sending..."
            }
            set((state) => {
                if(state.singleChat?.chat._id !== chatId){ // if the current chat is not the same as the chatId of the message being sent, do nothing
                    return state
                }
                return { // update the singleChat state with the new message
                    singleChat: {
                        ...state.singleChat,
                        message: [...state.singleChat.message, tempMessage]
                    }
                }
            })

            try {
                const { data } = await API.post('/chat/message/send', {
                    chatId,
                    content,
                    image,
                    replyToId: replyToId?._id
                })

                console.log("SEND MESSAGE RESPONSE:", data)

                const { msg: userMessage } = data
                // update the singleChat state with the new message
                set((state) => {
                      if (!state.singleChat || state.singleChat.chat._id !== chatId) return state;

                return { // update the singleChat state with the new message
                    singleChat: {
                        ...state.singleChat,
                        message: state.singleChat.message.map((message) => (
                            message._id === tempMessageId ? userMessage : message
                        ))
                    }
                }
                })

            } catch (error: any) {
                toast.error(error?.response?.data?.message || "Failed to send message")   
            } 
        }

    })
)

export { useChat }