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

/**
 * Fetches all FK constraints on the given table.
 * Returns an array of { constraintName, definition } so we can drop and re-add them.
 */
async function getForeignKeys(client, tableName) {
  const result = await client.query(
    `SELECT
       tc.constraint_name,
       pg_get_constraintdef(c.oid) AS definition
     FROM information_schema.table_constraints tc
     JOIN pg_constraint c ON c.conname = tc.constraint_name
     WHERE tc.table_schema = 'public'
       AND tc.table_name   = $1
       AND tc.constraint_type = 'FOREIGN KEY'`,
    [tableName],
  )
  return result.rows.map((r) => ({
    constraintName: r.constraint_name,
    definition: r.definition,
  }))
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
 * - For each table: drops its FK constraints, imports data, re-adds them
 *   so upload order doesn't matter and no superuser privilege is needed
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

    for (const { tempPath, tableName, filename } of confirmedFiles) {
      if (!fs.existsSync(tempPath)) {
        throw new Error(
          `Temp file missing for "${filename}". Please re-upload.`,
        )
      }

      const { columns, rows } = await parseCsv(tempPath)
      const exists = await tableExists(tableName)

      // Drop FK constraints before touching data so insert order doesn't matter
      const foreignKeys = exists ? await getForeignKeys(client, tableName) : []
      for (const fk of foreignKeys) {
        await client.query(
          `ALTER TABLE "${tableName}" DROP CONSTRAINT "${fk.constraintName}"`,
        )
      }

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

      // Restore FK constraints now that data is in place
      for (const fk of foreignKeys) {
        await client.query(
          `ALTER TABLE "${tableName}" ADD CONSTRAINT "${fk.constraintName}" ${fk.definition}`,
        )
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
    return results
  } catch (err) {
    await client.query("ROLLBACK")
    for (const { tempPath } of confirmedFiles) fs.unlink(tempPath, () => {})
    throw err
  } finally {
    client.release()
  }
}
