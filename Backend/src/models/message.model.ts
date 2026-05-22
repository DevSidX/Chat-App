import mongoose, { Schema , Document } from "mongoose";

export interface messageDocument extends Document {
    chatId: mongoose.Types.ObjectId
    sender: mongoose.Types.ObjectId 
    content?: string,
    image?: string,
    replyTo?: mongoose.Types.ObjectId 
    createdAt: Date
    updatedAttedAt: Date
}

const messageSchema = new mongoose.Schema<messageDocument>(
    {
        chatId: {
            type: mongoose.Types.ObjectId,
            ref: "Chat",
            required: true
        },
        sender: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true
        },
        content: {
            type: String
        },
        image: {
            type: String
        },
        replyTo: {
            type: mongoose.Types.ObjectId,
            ref: "Message",
            default: null
        },
    },
    {
        timestamps: true
    }
)

export const Message = mongoose.model<messageDocument>("Message", messageSchema)