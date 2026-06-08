import fs from "fs"
import path from "path"
import pool from "../db/index.js"
import { parseCsv } from "../utils/csvParser.js"
import { normalizeColName, coerceValue } from "../utils/dataCoercion.js"

const BATCH_SIZE = 500

function getRawValue(row, column) {
  const key = Object.keys(row).find((k) => normalizeColName(k) === column)
  return key ? row[key] : null
}

function inferTypeForValues(values) {
  const samples = values.filter(
    (v) => v !== null && v !== undefined && String(v).trim() !== "",
  )
  if (samples.length === 0) return "TEXT"

  let isInt = true
  let isNumeric = true
  let isBoolean = true
  let isDate = true
  let hasTime = false

  for (const raw of samples) {
    const value = String(raw).trim()

    if (!/^[+-]?\d+$/.test(value)) isInt = false
    if (!/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(value)) isNumeric = false
    if (!/^(true|false|0|1)$/i.test(value)) isBoolean = false

    const dateParsed = Date.parse(value)
    if (Number.isNaN(dateParsed)) {
      isDate = false
    } else {
      if (/[T ]\d{2}:\d{2}(:\d{2})?/.test(value)) {
        hasTime = true
      }
    }
  }

  if (isInt) return "INTEGER"
  if (isNumeric) return "NUMERIC"
  if (isBoolean) return "BOOLEAN"
  if (isDate) return hasTime ? "TIMESTAMP" : "DATE"
  return "TEXT"
}

function inferColumnTypes(columns, rows) {
  const types = {}

  for (const column of columns) {
    const values = rows.map((row) => getRawValue(row, column))
    types[column] = inferTypeForValues(values)
  }

  return types
}

function hasUniqueIdColumn(columns, rows) {
  if (!columns.includes("id")) return false
  const seen = new Set()
  for (const row of rows) {
    const raw = getRawValue(row, "id")
    const value = raw === null || raw === undefined ? "" : String(raw).trim()
    if (value === "" || seen.has(value)) return false
    seen.add(value)
  }
  return seen.size > 0
}

function singularize(name) {
  if (name.endsWith("ies")) return `${name.slice(0, -3)}y`
  if (name.endsWith("s")) return name.slice(0, -1)
  return name
}

function buildForeignKeyCandidates(tableInfos) {
  const tableMap = new Map(tableInfos.map((info) => [info.tableName, info]))
  const candidates = []

  for (const info of tableInfos) {
    for (const column of info.columns) {
      if (!column.endsWith("_id")) continue
      if (
        info.existingForeignKeys?.some((fk) =>
          fk.definition.includes(`"${column}"`),
        )
      )
        continue

      const baseName = column.slice(0, -3)
      const possibleTargets = [baseName, `${baseName}s`, singularize(baseName)]
      const targetTable = possibleTargets.find(
        (name) => name !== info.tableName && tableMap.has(name),
      )

      if (!targetTable) continue
      const targetInfo = tableMap.get(targetTable)
      if (!targetInfo.columns.includes("id")) continue

      candidates.push({
        tableName: info.tableName,
        column,
        targetTable,
        targetColumn: "id",
      })
    }
  }

  return candidates
}

async function isColumnUnique(client, tableName, column) {
  const result = await client.query(
    `SELECT COUNT("${column}") AS total,
            COUNT(DISTINCT "${column}") AS distinct_count
       FROM "${tableName}"
       WHERE "${column}" IS NOT NULL`,
  )
  const total = parseInt(result.rows[0].total, 10)
  const distinct = parseInt(result.rows[0].distinct_count, 10)
  return total > 0 && total === distinct
}

async function addForeignKey(client, fk) {
  const constraintName = `fk_${fk.tableName}_${fk.column}`.replace(
    /[^a-zA-Z0-9_]/g,
    "_",
  )
  await client.query(
    `ALTER TABLE "${fk.tableName}"
       ADD CONSTRAINT "${constraintName}"
       FOREIGN KEY ("${fk.column}")
       REFERENCES "${fk.targetTable}" ("${fk.targetColumn}")`,
  )
}

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
    // multer may provide either `path` (when using `dest`) or `destination`+`filename` (diskStorage).
    const actualPath =
      file.path ||
      (file.destination && file.filename
        ? path.join(file.destination, file.filename)
        : null)

    if (!actualPath) {
      throw new Error(
        `Cannot determine temp path for uploaded file ${file.originalname}`,
      )
    }

    const { columns, rows } = await parseCsv(actualPath)
    const exists = await tableExists(tableName)
    const existingRowCount = exists ? await getRowCount(tableName) : 0

    previews.push({
      filename: file.originalname,
      tableName,
      columns,
      newRowCount: rows.length,
      tableExists: exists,
      existingRowCount,
      hasExistingRows: exists && existingRowCount > 0,
      hasEmptyExistingTable: exists && existingRowCount === 0,
      tempPath: actualPath,
      tempDestination: file.destination || null,
      tempFilename: file.filename || null,
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

    const tableInfos = []

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
        const colTypes = inferColumnTypes(columns, rows)
        const colDefs = columns.map((c) => {
          const type = colTypes[c] || "TEXT"
          const pk =
            c === "id" && hasUniqueIdColumn(columns, rows) ? " PRIMARY KEY" : ""
          return `"${c}" ${type}${pk}`
        })
        await client.query(
          `CREATE TABLE "${tableName}" (${colDefs.join(", ")})`,
        )
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

      tableInfos.push({
        tableName,
        columns,
        rows,
        existingForeignKeys: foreignKeys,
        existing: exists,
      })

      results.push({
        filename,
        tableName,
        rowsInserted: inserted,
        tableCreated: !exists,
      })
      fs.unlink(tempPath, (err) => {
        if (err) console.error("Failed to delete temp file:", tempPath, err)
      })
    }

    // Restore existing foreign keys and add inferred relationships after all data is loaded
    for (const info of tableInfos) {
      for (const fk of info.existingForeignKeys) {
        await client.query(
          `ALTER TABLE "${info.tableName}" ADD CONSTRAINT "${fk.constraintName}" ${fk.definition}`,
        )
      }
    }

    const inferredFks = buildForeignKeyCandidates(tableInfos)
    for (const fk of inferredFks) {
      const targetInfo = tableInfos.find((t) => t.tableName === fk.targetTable)
      const canReference =
        targetInfo.existing || targetInfo.columns.includes("id")
      if (!canReference) continue

      if (targetInfo.existing) {
        const unique = await isColumnUnique(
          client,
          fk.targetTable,
          fk.targetColumn,
        )
        if (!unique) continue
      }

      await addForeignKey(client, fk)
    }

    await client.query("COMMIT")
    return results
  } catch (err) {
    await client.query("ROLLBACK")
    for (const { tempPath } of confirmedFiles) {
      try {
        fs.unlink(tempPath, (e) => {
          if (e)
            console.error(
              "Failed to delete temp file during rollback:",
              tempPath,
              e,
            )
        })
      } catch (e) {
        console.error("Rollback cleanup error for:", tempPath, e)
      }
    }
    throw err
  } finally {
    client.release()
  }
}
