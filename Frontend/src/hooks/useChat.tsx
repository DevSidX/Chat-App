import type { UserType } from "@/@Types/auth.type";
import type { chatType, createChatType, MessageType } from "@/@Types/chat.type";
import { API } from "@/lib/axiosClient";
import { toast } from "sonner";
import { create } from "zustand";

interface chatState {
    chats: chatType[]
    users: UserType[]
    singleChat: {
        chat: chatType,
        message: MessageType
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

    addNewChat: (newChat: chatType) => void

    updateChatLastMessage: (chatId: string, lastMessage: MessageType) => void
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

        fetchSingleChat: async () => {
            set({ isSingleChatLoading: true })

            try {
                const { data } = await API.get('/chat/single');
                set({ chats: data.chats })
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
        }

    })
)

export { useChat }