import { z } from "zod"

const emailSchema = z
    .string()
    .trim()
    .email("Invalid email address")
    .min(1)

const passwordSchema = z
    .string()
    .trim()
    .min(6)

const registerSchema = z.object({
    name: z.string().trim().min(1),
    email: emailSchema,
    password: passwordSchema,
    avatar: z.string().optional()
})

const loginSchema = z.object({
    email: emailSchema,
    password: passwordSchema
})

export type RegisterSchemaType = z.infer<typeof registerSchema>
export type LoginSchemaType = z.infer<typeof loginSchema>

export {  emailSchema, passwordSchema, registerSchema, loginSchema }