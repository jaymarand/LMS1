import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Run with: node --env-file=.env scripts/verify-tables.mjs');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function tableExists(name) {
  // Try unquoted (lowercased by Postgres) and quoted (case-sensitive)
  const unquoted = await sql`SELECT to_regclass(${name}) AS regclass;`;
  if (unquoted?.[0]?.regclass) return true;
  const quoted = await sql`SELECT to_regclass(${`"${name}"`}) AS regclass;`;
  return quoted?.[0]?.regclass ? true : false;
}

(async () => {
  try {
    const targets = ['users', 'courses', 'enrollcourse', 'enrollCourse'];
    const results = {};
    for (const t of targets) {
      results[t] = await tableExists(t);
    }
    // Also print current tables for clarity
    const tables = await sql`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    console.log(JSON.stringify(results, null, 2));
    console.log('tables:', tables.map(t => t.table_name));
    const allOk = Object.values(results).every(Boolean);
    process.exit(allOk ? 0 : 2);
  } catch (e) {
    console.error('Verification error:', e);
    process.exit(3);
  }
})();
