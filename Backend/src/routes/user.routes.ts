import { Router } from "express";
import { passportAuthenticateJwt } from "../middlewares/passport.middleware";
import { getUsers } from "../controllers/user.controller";

const router = Router()

router.use(passportAuthenticateJwt)

router.route("/all").get(
    passportAuthenticateJwt,
    getUsers
)

export default router