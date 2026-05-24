import { Router } from "express";
import { authStatus, login, logout, register } from "../controllers/auth.controller";
import { passportAuthenticateJwt } from "../middlewares/passport.middleware";

const router = Router()

router.route("/register").post(
    register
)

router.route("/login").post(
    login
)

router.route("/logout").post(
    logout
)

router.route("/status").get(
    passportAuthenticateJwt,
    authStatus
)

export default router