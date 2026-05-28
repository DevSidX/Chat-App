import { Request, Response } from "express";
import { AsyncHandler } from "../middlewares/asyncHandler.middleware";
import { httpStatus } from "../config/http.config";
import { chatIdSchema, createChatSchema } from "../validators/chat.validator";
import { createChatService, getSingleChatService, getUserChatsService } from "../services/chat.service";

const createChat = AsyncHandler( async (req:Request, res: Response) => {
    const userId = req.user?._id

    const body = createChatSchema.parse(req.body)

    const chat = await createChatService(userId, body)

    return res
    .status(httpStatus.OK)
    .json({
        message: "Chat created or retrieved successfully!!",
        chat
    })
})

const getUserChats = AsyncHandler( async (req:Request, res: Response) => {
    const userId = req.user?._id

    const chats = await getUserChatsService(userId)

    return res
    .status(httpStatus.OK)
    .json({
        message: "User chats retrieved successfully!!",
        chats
    })
})

const getSingleChat = AsyncHandler( async (req:Request, res: Response) => {
    const userId = req.user?._id

    const { id } = chatIdSchema.parse(req.params)

    const { chat, messages } = await getSingleChatService(id, userId)

    return res
    .status(httpStatus.OK)
    .json({
        message: "Single chat retrieved successfully!!",
        chat,
        messages
    })
})

export { createChat, getUserChats, getSingleChat }