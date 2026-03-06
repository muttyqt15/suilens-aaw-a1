import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgres://inventory_user:inventory_pass@localhost:5436/inventory_db';
const client = postgres(connectionString);
export const db = drizzle(client, { schema });
