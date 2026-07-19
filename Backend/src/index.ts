import dotenv from "dotenv"
dotenv.config();
import express, { Request, Response, NextFunction } from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import http from 'http'
import passport from "passport";

import { Env } from "./config/env.config";
import { AsyncHandler } from "./middlewares/asyncHandler.middleware";
import { httpStatus } from "./config/http.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import connectDB from "./db/database";
import { passportAuthenticateJwt } from "./middlewares/passport.middleware";
import { initializeSocket } from "./lib/socket";

const app = express()
const server = http.createServer(app)

// socket

initializeSocket(server)

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(cors({
    origin: Env.FRONTEND_ORIGIN,
    credentials: true
}));
app.use(passport.initialize())

app.get("/health", AsyncHandler (async (req: Request, res: Response) => {
    return res
    .status(httpStatus.OK)
    .json({
        message: "Server is healthy",
        status: "OK"
    })
}
))


// Routes

import authRouter from "./routes/auth.route"
import chatRouter from "./routes/chat.route"
import userRouter from "./routes/user.routes"
import path from "path/win32";

app.use(`/api/auth`, authRouter)
app.use(`/api/chat`, chatRouter)
app.use(`/api/user`, userRouter)


app.use(errorHandler)

// purpose = serve the frontend build files in production
if (Env.NODE_ENV === "production") {
    const clientPath = path.resolve(__dirname, "../../Frontend/dist")

    // serve the static file
    app.use(express.static(clientPath))

    app.get(/^(?!\/api)/, (req: Request, res: Response) => {
        res.sendFile(path.join(clientPath, "index.html"))
    })
}

server.listen(Env.PORT, async () => {
    await connectDB()
    console.log(`Server is running on port ${Env.PORT} in ${Env.NODE_ENV} mode`);
})

export default app