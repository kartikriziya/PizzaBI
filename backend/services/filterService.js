import pool from "../db/index.js"
import { tableExists } from "./csvImportService.js"

async function distinctValues(tableName, column) {
  if (!(await tableExists(tableName))) {
    console.log(
      `[filters] table ${tableName} is missing, returning no values for ${column}`,
    )
    return []
  }

  const result = await pool.query(
    `SELECT DISTINCT "${column}"
       FROM "${tableName}"
      WHERE "${column}" IS NOT NULL
      ORDER BY "${column}"`,
  )

  const values = result.rows
    .map((row) => row[column])
    .filter(
      (value) =>
        value !== null && value !== undefined && String(value).trim() !== "",
    )

  console.log(
    `[filters] loaded ${values.length} distinct values for ${tableName}.${column}`,
  )
  return values
}

export async function getFilters() {
  const [cities, states, categories, sizes] = await Promise.all([
    distinctValues("stores", "city"),
    distinctValues("stores", "state"),
    distinctValues("products", "category"),
    distinctValues("products", "size"),
  ])

  const payload = {
    cities,
    states,
    categories,
    sizes,
  }

  console.log("[filters] returning payload", payload)
  return payload
}
