import { z } from "zod"
import { auth } from "../services/auth"
import dbClient from "../db"
import { transactions } from "../db/schema"

const createTransactionSchema = z.object({
    categoryId: z.string().min(1, "Category is required"),
    type: z.enum(["expense", "income"], {
        message: "Type must be 'expense' or 'income'"
    }),
    amount: z.number().positive("Amount must be positive"),
    description: z.string().min(1, "Description is required").max(500, "Description must be at most 500 characters"),
    date: z.string().datetime("Invalid date format")
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
    const validation = createTransactionSchema.safeParse(body)

    if (!validation.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Validation error',
            data: validation.error.format()
        })
    }

    const db = dbClient()

    const newTransaction = {
        id: crypto.randomUUID(),
        userId: session.user.id,
        categoryId: validation.data.categoryId,
        type: validation.data.type,
        amount: validation.data.amount,
        description: validation.data.description,
        date: new Date(validation.data.date)
    }

    const result = await db.insert(transactions).values(newTransaction).returning()

    return result[0]
})
