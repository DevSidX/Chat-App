import mongoose from "mongoose"
import { Env } from "../config/env.config"

const connectDB = async () => {
    try {
        await mongoose.createConnection(Env.MONGO_URI)
        console.log("MONGODB connected Successfully!!");
        
    } catch (error) {
        console.log(`MONGODB connection Failed!!`);
        process.exit(1)
    }
}

export default connectDB