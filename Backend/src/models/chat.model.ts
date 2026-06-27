import mongoose, { Document } from "mongoose";

export interface chatDocument extends Document {
    participants: mongoose.Types.ObjectId[]
    lastMessage: mongoose.Types.ObjectId
    isGroup: boolean
    groupName: string
    createdBy: mongoose.Types.ObjectId
    createdAt: Date
    updatedAttedAt: Date
}

const chatSchema = new mongoose.Schema<chatDocument>(
    {
        participants: [
            {
                type: mongoose.Types.ObjectId,
                ref: "User",
                required: true
            }
        ],
        lastMessage: {
            type: mongoose.Types.ObjectId,
            ref: "Message",
            default: null
        },
        isGroup: {
            type: Boolean,
            default: false
        },
        groupName: {
            type: String
        },
        createdBy: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true
        },
    },
    {
        timestamps: true
    }
)

export const Chat = mongoose.model<chatDocument>("Chat", chatSchema)