import { Server as HTTPServer } from "http"
import { Server, type Socket } from "socket.io"
import { Env } from "../config/env.config";
import jwt from "jsonwebtoken"
import { validateChatParticipants } from "../services/chat.service";

interface AuthenticatedSocket extends Socket {
    userId?: string
}

let io: Server | null = null; // holds the Socket.io instance

// online users map to keep track of connected users and their socket IDs
const onlineUsers = new Map<string, string>() // Map<userId, socketId>


const initializeSocket = (httpServer: HTTPServer) => {
    io = new Server(httpServer, { 
        cors: {
            origin: Env.FRONTEND_ORIGIN,
            methods: ["GET", "POST"],
            credentials: true
        }
    })

    io.use(async (socket: AuthenticatedSocket , next) => {
        // Middleware to authenticate the socket connection using JWT from cookies
        // 1. Extracting the raw cookie string from the socket handshake headers.
        // 2. Parsing the cookie string to extract the JWT token (assuming a format like "token = abc123").
        // 3. Verifying the JWT token using the secret key defined in the environment variables.
        // 4. If the token is valid, decoding it to retrieve the user ID and attaching it to the socket object for later use.
        try {
            const rawCookie= socket.handshake.headers.cookie // get the raw cookie string from the handshake headers 

            if(!rawCookie){
                return next(new Error("Unauthorized")) // if there are no cookies, reject the connection
            }

            const token = rawCookie?.split("=")?.[1]?.trim() // extract the token from the cookie string (assuming format: "token=abc123")
            
            if(!token){
                return next(new Error("Unauthorized")) // if the token is missing, reject the connection
            }

            const decodedToken = jwt.verify(token, Env.JWT_SECRET) as { userId: string } // verify the token and decode it to get the user ID

            if(!decodedToken){
                return next(new Error("Unauthorized")) // if the token is invalid, reject the connection
            }
        
            socket.userId = decodedToken.userId // attach the user ID to the socket object for later use
            next()
        } catch (error) {
            return next(new Error("Internal Server Error")) 
        }
    })

    io.on("connection", (socket: AuthenticatedSocket) => {

        if(!socket.userId){
            socket.disconnect(true) // if the user ID is not attached to the socket, disconnect it
            return;
        }

        const userId = socket.userId 
        const newSocketId = socket.id

        console.log(`Socket connected`, { userId, newSocketId })

        //register socket for the user
        onlineUsers.set(userId, newSocketId)

        // broadcast online users to all connected clients/sockets
        io?.emit("online: users", Array.from(onlineUsers.keys())) 

        // create personal room for the user
        socket.join(`user: ${userId}`)

        /*
        Alice has 5 chats (with Bob, Charlie, Dave, Eve, Frank)
            Alice opens chat with Bob
            → frontend emits "chat: join", chatId: "bob-chat-99"
            → Alice joins ONLY "chat: bob-chat-99"
        */
        socket.on( 
            "chat: join", 
            async (chatId: string, callback?: (error?: string) => void) => {
                try {
                    await validateChatParticipants(chatId, userId) // validate if the user is a participant of the chat
                    socket.join(`chat: ${chatId}`) // join the chat room with the given chat ID
                    callback?.()  
                } catch (error) {
                    callback?.("Failed to join chat room")
                }
            }
        )

        socket.on("chat: leave", (chatId: string) => {
            if(!chatId){
                socket.leave(`chat: ${chatId}`) // leave the chat room with the given chat ID
                console.log(`User ${userId} left chat ${chatId}`)
            }
        })

        socket.on("disconnect", () => {
            if(onlineUsers.get(userId) === newSocketId){
                if(userId){
                    onlineUsers.delete(userId) // remove the user from the online users
                }

                // broadcast the updated online users to all connected clients/sockets
                io?.emit("online: users", Array.from(onlineUsers.keys())) 

                console.log(`Socket disconnected`, { userId, newSocketId })
            }
        })
    })
}

function getIo (){
    if(!io){
        throw new Error("Socket.io not initialized")
    }
    return io;
}

// Each participant gets the new chat instantly in their sidebar — without refreshing.
const emitNewChatToParticipants = (participantIds: string[] = [], chat: any) => {
    const io = getIo()
    for(const participantId of participantIds) {
        io.to(`user: ${participantId}`)
        .emit("chat: new", chat) // emit the new chat to the personal room of each participant
    }
};

const emitNewMessageToChatRoom = (senderId: string, chatId: string, message: any) => {
    const io = getIo()
    const senderSocketId = onlineUsers.get(senderId)
    
    if(senderSocketId){
        io.to(`chat: ${chatId}`)
        .except(senderSocketId)
        .emit("message: new", message)
    } else{
        io.to(`chat: ${chatId}`)
        .emit("message: new", message)
    }
}

const emitLastMessageToParticipants = (participantIds: string[], chatId: string, lastMessage: any) => {
    const io = getIo()
    const payload = { chatId, lastMessage }

    for(const participantId of participantIds) {
        io.to(`user: ${participantId}`)
        .emit("chat: update", payload)
    }
}

export { 
    initializeSocket, 
    AuthenticatedSocket, 
    emitNewChatToParticipants, 
    emitNewMessageToChatRoom, 
    emitLastMessageToParticipants 
}