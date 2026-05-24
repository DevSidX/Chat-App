import { LoginSchemaType, RegisterSchemaType } from "../validators/auth.validator"
import { User } from "../models/user.model"
import { NotFoundException, UnauthorizedException } from "../utils/AppError"

const registerService = async (body: RegisterSchemaType) => {
    const { email } = body

    const user = await User.findOne({ email })

    if(user){
        throw new UnauthorizedException("User already exists")
    }

    const newUser = await User.create({
        ...body
    })

    await newUser.save()

    return newUser
}

const loginService = async(body: LoginSchemaType) => {
    const { email, password } = body

    const user = await User.findOne({ email })

    if(!user){
        throw new NotFoundException("User not found!!")
    }

    const isPassword = await user.comparePassword(password)

    if(!isPassword){
        throw new UnauthorizedException("Invalid Password ")
    }

    return user
}

export {
    registerService,
    loginService
}