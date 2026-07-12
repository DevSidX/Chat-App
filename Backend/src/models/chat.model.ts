import mongoose, { Document } from "mongoose";

export interface chatDocument extends Document {
    participants: mongoose.Types.ObjectId[]
    lastMessage: mongoose.Types.ObjectId
    isGroup: boolean
    groupName: string
    isAiChat: boolean
    createdBy: mongoose.Types.ObjectId
    createdAt: Date
    updatedAt: Date
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
        isAiChat: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
)

chatSchema.pre("save", async function (next) {
    if (this.isNew) {
        const User = mongoose.model("User")
        const participants = await User.find({
            _id: {
                $in: this.participants
            },
            isAI: true
        })

        if(participants.length > 0) {
            this.isAiChat = true
        }
    }
    // next()
})

export const Chat = mongoose.model<chatDocument>("Chat", chatSchema)