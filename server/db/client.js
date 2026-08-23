// Postgres connection + Drizzle instance, shared across the app
import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema.js';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. Copy .env.example to .env and configure it.');
}

const queryClient = postgres(process.env.DATABASE_URL);

export const db = drizzle(queryClient, { schema });
