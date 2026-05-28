import { User } from "../models/user.model"


const findByIdUserService = async (userId: string) => {
    return await User.findById(userId)

}

const getUsersService = async (userId: string) => {
    const users = await User.find({
        _id: {
            $ne: userId
        }
    })

    return users
}

export { findByIdUserService, getUsersService }