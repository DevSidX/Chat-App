import { z } from "zod"

const createChatSchema = z.object({
    participantId: z.string().trim().min(1).optional(),
    isGroup: z.boolean().optional(),
    participants: z.array( z.string().trim().min(1)).optional(),
    groupname: z.string().trim().min(1).optional()
})

const chatIdSchema = z.object({
    id: z.string().trim().min(1)
})

export { createChatSchema, chatIdSchema }