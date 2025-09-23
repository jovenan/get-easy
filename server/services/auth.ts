import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import getClient from "../db";
import * as schema from "../db/schema";

export const auth = betterAuth({
    database: drizzleAdapter(getClient(), {
        provider: "sqlite",
        schema,
    }),
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    secret: process.env.BETTER_AUTH_SECRET,
    emailAndPassword: {
        enabled: true, 
    }, 
})