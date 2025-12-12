import { z } from "zod"
import { auth } from "../services/auth";
import dbClient from "../db"
import { categories } from "../db/schema";

const createCategorySchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters"),
    type: z.enum(["expense", "income"], {
        message: "Type must be 'expense' or 'income'"
    })
})

export default defineEventHandler(async (event) => {
    const session = await auth.api.getSession({
        headers: event.headers
    })

    if (!session) {
        throw createError({
            statusCode: 401,
            statusMessage: 'No session found',
        })
    }

    const body = await readBody(event)
    const validation = createCategorySchema.safeParse(body)

    if (!validation.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Validation error',
            data: validation.error.format()
        })
    }

    const db = dbClient()

    const newCategory = {
        id: crypto.randomUUID(),
        userId: session.user.id,
        name: validation.data.name,
        type: validation.data.type,
        createdAt: new Date()
    }

    const result = await db.insert(categories).values(newCategory).returning()

    return result[0]
})
