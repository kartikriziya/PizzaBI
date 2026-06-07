import fs from "fs"
import path from "path"
import pool from "../db/index.js"
import { parseCsv } from "../utils/csvParser.js"
import { normalizeColName, coerceValue } from "../utils/dataCoercion.js"

const BATCH_SIZE = 500

// ── DB helpers ────────────────────────────────────────────────────────────────

/** Derives a snake_case table name from an uploaded filename.
 *  e.g. "My Orders 2024.csv" → "my_orders_2024" */
export function tableNameFromFile(filename) {
  return path
    .basename(filename, path.extname(filename))
    .toLowerCase()
    .replace(/[\s\-]+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
}

/** Returns true if a table exists in the public schema */
export async function tableExists(tableName) {
  const result = await pool.query(
    `SELECT EXISTS (
       SELECT FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = $1
     )`,
    [tableName],
  )
  return result.rows[0].exists
}

/** Returns the current row count of an existing table */
export async function getRowCount(tableName) {
  const result = await pool.query(`SELECT COUNT(*) FROM "${tableName}"`)
  return parseInt(result.rows[0].count, 10)
}

/** Returns a map of { columnName → dataType } for an existing table */
export async function getColumnTypes(tableName) {
  const result = await pool.query(
    `SELECT column_name, data_type
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1`,
    [tableName],
  )
  const map = {}
  for (const row of result.rows) map[row.column_name] = row.data_type
  return map
}

// ── Core service functions ────────────────────────────────────────────────────

/**
 * Analyses uploaded temp files without touching the DB.
 * Returns an array of preview objects the frontend uses to show the confirm dialog.
 */
export async function previewFiles(uploadedFiles) {
  const previews = []

  for (const file of uploadedFiles) {
    const tableName = tableNameFromFile(file.originalname)
    const { columns, rows } = await parseCsv(file.path)
    const exists = await tableExists(tableName)
    const existingRowCount = exists ? await getRowCount(tableName) : 0

    previews.push({
      filename: file.originalname,
      tableName,
      columns,
      newRowCount: rows.length,
      tableExists: exists,
      existingRowCount,
      tempPath: file.path,
    })
  }

  return previews
}

/**
 * Imports confirmed files into PostgreSQL.
 * - Runs inside a single transaction (all succeed or all roll back)
 * - Disables FK checks so upload order doesn't matter
 * - Deletes existing rows before inserting if the table already exists
 * - Creates the table automatically if it doesn't exist yet
 * - Inserts rows in batches of 500 for performance
 * - Coerces values to match actual Postgres column types
 */
export async function importFiles(confirmedFiles) {
  const results = []
  const client = await pool.connect()

  try {
    await client.query("BEGIN")
    // Disable FK trigger checks so upload order doesn't matter.
    // Requires the DB user to have SUPERUSER or REPLICATION privilege.
    await client.query("SET session_replication_role = replica")

    for (const { tempPath, tableName, filename } of confirmedFiles) {
      if (!fs.existsSync(tempPath)) {
        throw new Error(
          `Temp file missing for "${filename}". Please re-upload.`,
        )
      }

      const { columns, rows } = await parseCsv(tempPath)
      const exists = await tableExists(tableName)

      if (exists) {
        await client.query(`DELETE FROM "${tableName}"`)
      } else {
        const colDefs = columns.map((c) => `"${c}" TEXT`).join(", ")
        await client.query(`CREATE TABLE "${tableName}" (${colDefs})`)
      }

      // Fetch actual Postgres column types for value coercion
      const colTypes = await getColumnTypes(tableName)

      // Insert in batches
      let inserted = 0
      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE)

        const placeholders = batch
          .map(
            (_, ri) =>
              `(${columns.map((_, ci) => `$${ri * columns.length + ci + 1}`).join(", ")})`,
          )
          .join(", ")

        const values = batch.flatMap((row) =>
          columns.map((col) => {
            const key = Object.keys(row).find(
              (k) => normalizeColName(k) === col,
            )
            const raw = key ? row[key] : null
            return coerceValue(raw, colTypes[col])
          }),
        )

        await client.query(
          `INSERT INTO "${tableName}" (${columns.map((c) => `"${c}"`).join(", ")}) VALUES ${placeholders}`,
          values,
        )
        inserted += batch.length
      }

      results.push({
        filename,
        tableName,
        rowsInserted: inserted,
        tableCreated: !exists,
      })
      fs.unlink(tempPath, () => {})
    }

    await client.query("COMMIT")
    await client.query("SET session_replication_role = DEFAULT")
    return results
  } catch (err) {
    await client.query("ROLLBACK")
    await client.query("SET session_replication_role = DEFAULT")
    for (const { tempPath } of confirmedFiles) fs.unlink(tempPath, () => {})
    throw err // let the route handler return the error response
  } finally {
    client.release()
  }
}
