import passport from "passport"
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt"
import { UnauthorizedException } from "../utils/AppError"
import { Env } from "../config/env.config"
import { findByIdUserService } from "../services/user.service"

/*
This strategy checks:

where the token comes from
whether the token is valid
whether the user exists
*/ 
passport.use(
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req) => {
                    const token = req.cookies.accessToken

                    if(!token){
                        throw new UnauthorizedException("Unauthorized access")
                    }
                    return token
                }
            ]),
            secretOrKey: Env.JWT_SECRET,
            audience: ['user'],
            algorithms: ['HS256']
        },
        async ({userId}, done) => {
            try {
                const user = userId && (await findByIdUserService(userId))
                return done(null, user || false)
            } catch (error) {
                return done(null, false);
            }
        }
    )
)

const passportAuthenticateJwt = passport.authenticate(
    "jwt",
    {
        session: false
    }
)

export { passportAuthenticateJwt }