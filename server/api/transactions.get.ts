import { eq, and, gte, lte } from "drizzle-orm"
import { auth } from "../services/auth"
import dbClient from "../db"
import { transactions } from "../db/schema"

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

    const query = getQuery(event)
    const startDate = query.startDate as string | undefined
    const endDate = query.endDate as string | undefined
    const categoryId = query.categoryId as string | undefined

    const db = dbClient()

    const conditions = [eq(transactions.userId, session.user.id)]

    if (startDate) {
        const startTimestamp = new Date(startDate).getTime()
        conditions.push(gte(transactions.date, new Date(startTimestamp)))
    }

    if (endDate) {
        const endTimestamp = new Date(endDate).getTime() + 86400000
        conditions.push(lte(transactions.date, new Date(endTimestamp)))
    }

    if (categoryId) {
        conditions.push(eq(transactions.categoryId, categoryId))
    }

    const result = await db.select().from(transactions).where(and(...conditions))

    return result
})
