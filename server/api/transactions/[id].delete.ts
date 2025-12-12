import { eq, and } from "drizzle-orm"
import { auth } from "../../services/auth"
import dbClient from "../../db"
import { transactions } from "../../db/schema"

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

    await db.delete(transactions)
        .where(and(
            eq(transactions.id, id),
            eq(transactions.userId, session.user.id)
        ))

    return { success: true }
})
