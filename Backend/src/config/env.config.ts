import { getEnv } from "../utils/getEnv";

const envConfig = () => ({
    NODE_ENV: getEnv("NODE_ENV", "development"),
    PORT: getEnv("PORT","8000"),
    MONGO_URI: getEnv("MONGO_URI"),
    JWT_SECRET: getEnv("JWT_SECRET","jwt_secret_key"),
    JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN","7d"),
    FRONTEND_ORIGIN: getEnv("FRONTEND_ORIGIN","http://localhost:5173"),
})

export const Env = envConfig()