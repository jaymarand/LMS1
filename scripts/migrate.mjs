import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';

async function main() {
  try {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error('DATABASE_URL is not set. Use node --env-file=.env scripts/migrate.mjs or set env vars.');
    }

    const sql = neon(url);
    const db = drizzle({ client: sql });

    await migrate(db, { migrationsFolder: 'drizzle' });
    console.log('Drizzle migrations completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exitCode = 1;
  }
}

main();
