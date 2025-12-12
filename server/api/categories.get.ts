import { eq } from "drizzle-orm"
import { auth } from "../services/auth";
import dbClient from "../db"
import { categories } from "../db/schema";

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

    const db = dbClient()

    const result = await db.select().from(categories).where(eq(categories.userId, session.user.id))

    return result
})
