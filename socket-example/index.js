import { Server } from "socket.io"
import http from "http"

const server = http.createServer()
const io = new Server(server, {
    cor: {
        origin: "*",
    }
})

io.on("connection", (socket) => {
    console.log(`New user connected: ${socket.id}`)

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`)
    })
})

server.listen(3000, () => {
    console.log("Server is running on port 3000")
})
