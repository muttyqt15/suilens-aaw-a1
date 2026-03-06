import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgres://notification_user:notification_pass@localhost:5435/notification_db';
const client = postgres(connectionString);
export const db = drizzle(client, { schema });
