import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgres://order_user:order_pass@localhost:5434/order_db';
const client = postgres(connectionString);
export const db = drizzle(client, { schema });
