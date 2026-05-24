import dotenv from "dotenv"
dotenv.config();
import express, { Request, Response, NextFunction } from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import passport from "passport";

import { Env } from "./config/env.config";
import { AsyncHandler } from "./middlewares/asyncHandler.middleware";
import { httpStatus } from "./config/http.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import connectDB from "./db/database";
import { passportAuthenticateJwt } from "./middlewares/passport.middleware";

const app = express()

app.use(express.json())
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

app.use(`/api/auth`, authRouter)


app.use(errorHandler)

app.listen(Env.PORT, async () => {
    await connectDB()
    console.log(`Server is running on port ${Env.PORT} in ${Env.NODE_ENV} mode`);
})

export default app