import { User } from "../models/user.model"


const findByIdUserService = async (userId: any) => {
    return await User.findById(userId)

}

export { findByIdUserService }