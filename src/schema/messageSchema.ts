import { z } from "zod";

export const messageSchema = z.object({
    Content: z
    .string()
    .min(10, {message: "message must be atleast 10 characters"})
    .max(300, {message: "message must be no longer than 300 characters"})
})