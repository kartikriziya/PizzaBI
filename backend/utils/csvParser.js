import fs from "fs"
import csv from "csv-parser"
import { normalizeColName } from "./dataCoercion.js"

/**
 * Detects the delimiter of a CSV file by reading its first line
 * and counting occurrences of each candidate character.
 * Supports: comma, semicolon, tab, pipe.
 */
export function detectDelimiter(filePath) {
  const firstLine = fs.readFileSync(filePath, "utf8").split("\n")[0] || ""
  const candidates = [",", ";", "\t", "|"]
  let best = ","
  let bestCount = 0
  for (const delimiter of candidates) {
    const count = firstLine.split(delimiter).length - 1
    if (count > bestCount) {
      bestCount = count
      best = delimiter
    }
  }
  return best
}

/**
 * Parses a CSV file from disk.
 * - Auto-detects the delimiter
 * - Normalizes column names to snake_case (handles camelCase, spaces, special chars)
 * Returns: { columns: string[], rows: object[] }
 */
export function parseCsv(filePath) {
  return new Promise((resolve, reject) => {
    const rows = []
    let columns = null
    const delimiter = detectDelimiter(filePath)

    fs.createReadStream(filePath)
      .pipe(csv({ separator: delimiter }))
      .on("headers", (headers) => {
        columns = headers.map((h) => normalizeColName(h))
      })
      .on("data", (row) => rows.push(row))
      .on("end", () => resolve({ columns, rows }))
      .on("error", reject)
  })
}
