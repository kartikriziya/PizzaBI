import dotenv from 'dotenv';
dotenv.config({ path: 'backend/.env' });

const { default: pool } = await import('../backend/db/index.js');

const tables = (await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name")).rows;
for (const { table_name } of tables) {
  const cols = (await pool.query(
    "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position",
    [table_name],
  )).rows;
  console.log(table_name + ' => ' + cols.map((c) => c.column_name).join(', '));
}

await pool.end();
