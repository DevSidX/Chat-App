import { Request, Response } from "express";
import { AsyncHandler } from "../middlewares/asyncHandler.middleware";
import { httpStatus } from "../config/http.config";
import { getUsersService } from "../services/user.service";

const getUsers = AsyncHandler( async (req:Request, res: Response) => {
    const { userId } = req.user?._id

    const users = await getUsersService(userId)

    return res
    .status(httpStatus.OK)
    .json({
        message: "All users fetched successfully!!",
        users
    })
})

export { getUsers }