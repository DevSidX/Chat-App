import { AsyncHandler } from "../middlewares/asyncHandler.middleware";
import { Response, Request } from "express";
import { loginSchema, registerSchema } from "../validators/auth.validator";
import { httpStatus } from "../config/http.config";
import { loginService, registerService } from "../services/auth.service";
import { clearJwtAuthCookie, setJwtAuthCookie } from "../utils/cookies";

const register = AsyncHandler ( async (req: Request, res: Response) => {
    const body = registerSchema.parse(req.body)

    const registeredUser = await registerService(body)
    const userId = registeredUser._id.toString()

    return setJwtAuthCookie({
        res,
        userId,
    })
    .status(httpStatus.CREATED)
    .json({
        message: "User created and logged in Successfully!!",
        registeredUser
    })
})

const login = AsyncHandler ( async (req: Request, res: Response) => {
    const body = loginSchema.parse(req.body)

    const loginedUser = await loginService(body)
    const userId = loginedUser._id.toString()

    return setJwtAuthCookie({
        res,
        userId,
    })
    .status(httpStatus.OK)
    .json({
        message: "User logged in Successfully!!",
        loginedUser
    })
})

const logout = AsyncHandler( async (req: Request, res:Response) => {
    return clearJwtAuthCookie(res)
    .status(httpStatus.OK)
    .json({
        message: "User logged out Successfully!!"
    })
})

const authStatus = AsyncHandler( async (req: Request, res:Response) => {
    const user = req.user
    
    return res
    .status(httpStatus.OK)
    .json({
        message: "Authenticated User",
        user
    })
})

export { register, login, logout, authStatus }