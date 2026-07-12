import { getEnv } from "../utils/getEnv";

const envConfig = () => ({
    NODE_ENV: getEnv("NODE_ENV", "development"),
    PORT: getEnv("PORT","8000"),
    MONGO_URI: getEnv("MONGO_URI"),
    JWT_SECRET: getEnv("JWT_SECRET","jwt_secret_key"),
    JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN","7d"),
    GOOGLE_GEMINI_API: getEnv("GOOGLE_GEMINI_API"),
    FRONTEND_ORIGIN: getEnv("FRONTEND_ORIGIN","http://localhost:5173"),

    // cloudinary
    CLOUDINARY_CLOUD_NAME: getEnv("CLOUDINARY_CLOUD_NAME"), 
    CLOUDINARY_API_KEY: getEnv("CLOUDINARY_API_KEY") ,
    CLOUDINARY_API_SECRET: getEnv("CLOUDINARY_API_SECRET") 
}) as const

export const Env = envConfig()