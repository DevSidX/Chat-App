//  This hook wraps socket.io-client so we don't have to manually manage the connection in every component.
// steps 
// 1. Create a socket connection when the component mounts.
// 2. Provide the socket connection to the component tree via context.
// This allows us to easily use the socket connection in any component without having to worry about managing the connection lifecycle.
// Note: This hook assumes that the server is running on the same host as the frontend. If your server is running on a different host, you will need to update the BASE_URL variable accordingly.

import { Socket, io } from 'socket.io-client'
import { create }  from 'zustand'

const BASE_URL = import.meta.env.MODE === 'development' ? import.meta.env.VITE_API_URL : '/'

interface SocketState  {
    socket: Socket | null
    onlineUsers: string[]
    connectSocket: () => void
    disconnectSocket: () => void
}

const useSocket = create<SocketState>()( (set, get) => ({
    socket: null,
    onlineUsers: [],

    connectSocket: () => {
        const { socket } = get()

        if (socket?.connected) {
            return 
        }

        const newSocket = io(BASE_URL, {
            withCredentials: true,
            autoConnect: true,
        })

        set({ socket: newSocket })

        newSocket.on('connect', () => {
            console.log('Socket connected:', newSocket.id)
        })

        newSocket.on("online: users", (userIds) => {
            console.log("Online users:", userIds)
            set({ onlineUsers: userIds })
        })

    },
    disconnectSocket: () => {
        const { socket } = get()

        if(socket) {
            socket.disconnect()
            set({
                socket: null,
            })
        }
    }
}))

export { useSocket }