import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '.env') })

const { default: pool } = await import('./db/index.js')

const tables = (await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name")).rows
for (const { table_name } of tables) {
  const cols = (await pool.query(
    "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position",
    [table_name],
  )).rows
  console.log(table_name + ' => ' + cols.map((c) => c.column_name).join(', '))
}

await pool.end()
