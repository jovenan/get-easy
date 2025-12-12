import { z } from "zod"
import { eq, and } from "drizzle-orm"
import { auth } from "../../services/auth"
import dbClient from "../../db"
import { transactions } from "../../db/schema"

const updateTransactionSchema = z.object({
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

    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Transaction ID is required',
        })
    }

    const body = await readBody(event)

    const validation = updateTransactionSchema.safeParse(body)
    if (!validation.success) {
        throw createError({
            statusCode: 400,
            statusMessage: validation.error.issues[0].message,
        })
    }

    const db = dbClient()

    const existingTransaction = await db.select()
        .from(transactions)
        .where(and(
            eq(transactions.id, id),
            eq(transactions.userId, session.user.id)
        ))
        .limit(1)

    if (existingTransaction.length === 0) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Transaction not found',
        })
    }

    const { categoryId, type, amount, description, date } = validation.data

    const result = await db.update(transactions)
        .set({
            categoryId,
            type,
            amount,
            description,
            date: new Date(date)
        })
        .where(and(
            eq(transactions.id, id),
            eq(transactions.userId, session.user.id)
        ))
        .returning()

    return result[0]
})
