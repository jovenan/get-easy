import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

let client: ReturnType<typeof drizzle> | null = null;

const getClient = () => {
    if (client) {
        return client;
    }
    client = drizzle({ 
        connection: { 
            url: process.env.TURSO_DATABASE_URL!, 
            authToken: process.env.TURSO_AUTH_TOKEN!
        },
        schema
    });
    return client;
}


export default getClient;