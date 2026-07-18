import "dotenv/config"
import connectDB from "../db/database"
import { User } from "../models/user.model"

const createAi = async () => {

    const existingChat = await User.findOne({ isAI: true })

    if(existingChat){
        console.log("✅ TalkAI already exists")
        return existingChat
    }

    const TalkAI = await User.create({
        name: "Talk Ai",
        isAI: true,
        avatar: "https://res.cloudinary.com/dwxqt9lpz/image/upload/v1783629990/talkio_ai_assistant_logo_p25crq.png"
    })
    console.log("✅ TalkAI created successfully")
    return TalkAI
}

const seedTalkAI = async () => {
    try {
        await connectDB()
        await createAi()
        console.log("✅ Seeding completed")  
        process.exit(0)
    } catch (error) {
        console.error("❌ Seeding failed", error)
        process.exit(1)
    }
}

seedTalkAI()


export { createAi, seedTalkAI }