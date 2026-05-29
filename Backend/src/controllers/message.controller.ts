import { Request, Response } from "express";
import { AsyncHandler } from "../middlewares/asyncHandler.middleware";
import { httpStatus } from "../config/http.config";
import { sendMessageSchema } from "../validators/message.validator";
import { sendMessageService } from "../services/message.service";

const sendMessage = AsyncHandler( async (req:Request, res: Response) => {
    const userId = req.user?._id

    const body = sendMessageSchema.parse(req.body)

    const msg = await sendMessageService(userId, body)

    return res
    .status(httpStatus.OK)
    .json({
        message: "Message send successfully!!",
        ...msg
    })
})

export { sendMessage }