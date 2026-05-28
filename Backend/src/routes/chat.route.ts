import { Router } from "express";
import { createChat, getSingleChat, getUserChats } from "../controllers/chat.controller";
import { passportAuthenticateJwt } from "../middlewares/passport.middleware";

const router = Router()

router.use(passportAuthenticateJwt)

router.route("/create").post(
    createChat
)

router.route("/all").get(
    getUserChats   
)

router.route("/:id").get(
    getSingleChat
)

export default router