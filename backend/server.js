import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import multer from "multer"
import csv from "csv-parser"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import pool from "./db/index.js"

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(express.json())

// Ensure uploads temp dir exists
const uploadDir = path.join(__dirname, "uploads")
fs.mkdirSync(uploadDir, { recursive: true })

// Multer — CSV only, temp disk storage
const upload = multer({
  dest: uploadDir,
  fileFilter: (req, file, cb) => {
    if (!file.originalname.toLowerCase().endsWith(".csv")) {
      return cb(new Error("Only CSV files are allowed"))
    }
    cb(null, true)
  },
})

// ── Helpers ──────────────────────────────────────────────────────────────────

/** "My Orders 2024.csv" → "my_orders_2024" */
function tableNameFromFile(filename) {
  return path
    .basename(filename, path.extname(filename))
    .toLowerCase()
    .replace(/[\s\-]+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
}

/** Detect delimiter by reading the first line of the file */
function detectDelimiter(filePath) {
  const firstLine = fs.readFileSync(filePath, "utf8").split("\n")[0] || ""
  const candidates = [",", ";", "\t", "|"]
  let best = ","
  let bestCount = 0
  for (const d of candidates) {
    const count = firstLine.split(d).length - 1
    if (count > bestCount) {
      bestCount = count
      best = d
    }
  }
  return best
}

/** Parse a CSV file on disk → { columns, rows } */
function parseCsv(filePath) {
  return new Promise((resolve, reject) => {
    const rows = []
    let columns = null
    const delimiter = detectDelimiter(filePath)
    fs.createReadStream(filePath)
      .pipe(csv({ separator: delimiter }))
      .on("headers", (headers) => {
        columns = headers.map((h) =>
          h
            .trim()
            .replace(/([a-z])([A-Z])/g, "$1_$2")
            .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
            .toLowerCase()
            .replace(/\s+/g, "_")
            .replace(/[^a-z0-9_]/g, ""),
        )
      })
      .on("data", (row) => rows.push(row))
      .on("end", () => resolve({ columns, rows }))
      .on("error", reject)
  })
}

async function tableExists(tableName) {
  const result = await pool.query(
    `SELECT EXISTS (
       SELECT FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = $1
     )`,
    [tableName],
  )
  return result.rows[0].exists
}

async function getRowCount(tableName) {
  const result = await pool.query(`SELECT COUNT(*) FROM "${tableName}"`)
  return parseInt(result.rows[0].count, 10)
}

/** Returns { colName: dataType } for an existing table */
async function getColumnTypes(tableName) {
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

/** Same camelCase → snake_case normalizer used for headers */
function normalizeColName(h) {
  return h
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
}

/**
 * Coerce a raw CSV string value to something Postgres will accept.
 * - numeric/decimal columns: strip non-numeric chars, return null if unparseable
 * - integer columns: same, floor to integer
 * - everything else: pass through as-is
 */
function coerceValue(raw, dataType) {
  if (raw === null || raw === undefined || raw === "") return null

  const numericTypes = [
    "numeric",
    "decimal",
    "real",
    "double precision",
    "money",
  ]
  const intTypes = [
    "integer",
    "bigint",
    "smallint",
    "int",
    "int2",
    "int4",
    "int8",
  ]

  if (numericTypes.some((t) => dataType?.includes(t))) {
    // Keep digits, dot, minus sign only
    const cleaned = String(raw).replace(/[^0-9.\-]/g, "")
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? null : parsed
  }

  if (intTypes.some((t) => dataType?.includes(t))) {
    const cleaned = String(raw).replace(/[^0-9\-]/g, "")
    const parsed = parseInt(cleaned, 10)
    return isNaN(parsed) ? null : parsed
  }

  return raw
}

// ── Existing routes ───────────────────────────────────────────────────────────

app.get("/", (req, res) => res.send("PERN Backend Running 🚀"))

app.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users")
    res.json(result.rows)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
})

// ── CSV upload routes ─────────────────────────────────────────────────────────

/**
 * POST /api/csv/preview
 * Accepts CSV files, parses them, returns table info + warnings.
 * Does NOT touch the database.
 */
app.post("/api/csv/preview", upload.array("files"), async (req, res) => {
  const previews = []
  try {
    for (const file of req.files) {
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
    res.json({ success: true, previews })
  } catch (err) {
    for (const file of req.files || []) fs.unlink(file.path, () => {})
    res.status(500).json({ success: false, error: err.message })
  }
})

/**
 * POST /api/csv/confirm
 * Deletes old data and inserts new rows. Fully transactional.
 * Body: { confirmedFiles: [{ tempPath, tableName, filename }] }
 */
app.post("/api/csv/confirm", async (req, res) => {
  const { confirmedFiles } = req.body
  const results = []
  const client = await pool.connect()

  try {
    await client.query("BEGIN")
    // Defer all foreign key checks until COMMIT so upload order doesn't matter
    await client.query("SET CONSTRAINTS ALL DEFERRED")

    for (const fileInfo of confirmedFiles) {
      const { tempPath, tableName, filename } = fileInfo

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

      // Fetch actual column types from Postgres so we can coerce values correctly
      const colTypes = await getColumnTypes(tableName)

      // Batch insert (500 rows at a time)
      const BATCH = 500
      let inserted = 0
      for (let i = 0; i < rows.length; i += BATCH) {
        const batch = rows.slice(i, i + BATCH)
        const placeholders = batch
          .map(
            (_, ri) =>
              `(${columns.map((_, ci) => `$${ri * columns.length + ci + 1}`).join(", ")})`,
          )
          .join(", ")

        const values = batch.flatMap((row) =>
          columns.map((col) => {
            // Match raw CSV header to our normalized column name
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
    res.json({ success: true, results })
  } catch (err) {
    await client.query("ROLLBACK")
    for (const f of confirmedFiles) fs.unlink(f.tempPath, () => {})
    res.status(500).json({ success: false, error: err.message })
  } finally {
    client.release()
  }
})

/**
 * POST /api/csv/cancel
 * Cleans up temp files when user cancels the confirm dialog.
 */
app.post("/api/csv/cancel", (req, res) => {
  const { tempPaths = [] } = req.body
  tempPaths.forEach((p) => fs.unlink(p, () => {}))
  res.json({ success: true })
})

// ── Start ─────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
