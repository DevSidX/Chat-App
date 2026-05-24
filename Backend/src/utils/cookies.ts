import jwt from "jsonwebtoken"
import { Env } from "../config/env.config"
import { Response } from "express"

type Time = `${number}${"s" | "m" | "h" | "d" | "w" | "m"}`

type cookie = {
    res: Response,
    userId: string
}

// response + blob(hdsb+wqgy-)

// will be used when the user signUp/login
const setJwtAuthCookie = ({ res, userId }: cookie) => {
    const payload = { userId }
    const expireIn = Env.JWT_EXPIRES_IN as Time

    // generate token
    const token = jwt.sign(
        payload, 
        Env.JWT_SECRET, 
        {
            audience: ["user"],
            expiresIn: expireIn || "7d"
        }
    )

    // set the secure cookiex
    return res
    .cookie(
        "accessToken", 
        token,
        { // cookie options
            maxAge: 7 * 24 * 60 * 60 * 1000, // for 7 days,
            httpOnly: true,
            secure: Env.NODE_ENV === "production" ? true : false,
            sameSite: Env.NODE_ENV === "production" ? "strict" : "lax", // "most secure" : "less secure"
        }
    )
}

// will be used when the user will logout
const clearJwtAuthCookie = (res: Response) => {
    return res.clearCookie(
        "accessToken",
        {
            path: "/"
        }
    )
}

export { setJwtAuthCookie, clearJwtAuthCookie }