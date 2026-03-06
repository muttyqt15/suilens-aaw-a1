import { execFileSync } from 'child_process';
import { db } from './src/db';
import { lenses } from './src/db/schema';
import { sql } from 'drizzle-orm';

async function start() {
  // Run schema migration
  console.log('Running schema migration...');
  execFileSync('bunx', ['drizzle-kit', 'push'], { stdio: 'inherit' });

  // Seed only if lenses table is empty
  const existing = await db.select({ count: sql<number>`count(*)` }).from(lenses);
  if (Number(existing[0].count) === 0) {
    console.log('Seeding database...');
    execFileSync('bun', ['run', 'src/db/seed.ts'], { stdio: 'inherit' });
  } else {
    console.log(`Database already seeded (${existing[0].count} lenses).`);
  }

  // Start the app
  console.log('Starting application...');
  await import('./src/index');
}

start().catch((err) => {
  console.error('Startup failed:', err);
  process.exit(1);
});
