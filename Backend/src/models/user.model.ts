import mongoose, { Document } from "mongoose";
import { comparePassword, hashPassword } from "../utils/bcrypt";

export interface userDocument extends Document {
    name: string,
    email: string,
    password: string,
    avatar?: string | null,
    createdAt: Date,
    updatedAt: Date,

    comparePassword(password: string): Promise<boolean>
}

const userSchema = new mongoose.Schema<userDocument>(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        password: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
            default: true
        },
    }, 
    { 
        timestamps: true ,
        // automatically removes the password when sending response to client
        toJSON: {
            transform: (doc, ret) => {
                if(ret){
                    delete (ret as any).password
                }
                return ret
            }
        }
    }
)

userSchema.pre("save", async function (next) {
    if(this.password && this.isModified("password")){
        this.password = await hashPassword(this.password)
    }
    // next()
})

userSchema.methods.comparePassword = async function (password: string) {
    return await comparePassword(password, this.password)
}

export const User = mongoose.model<userDocument>("User", userSchema)