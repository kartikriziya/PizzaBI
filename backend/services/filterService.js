import pool from "../db/index.js"

function normalizeFilterValue(value) {
  if (value === undefined || value === null) return null
  const trimmed = String(value).trim()
  return trimmed === "" ? null : trimmed
}

function sortValues(values) {
  return Array.from(new Set(values.filter(Boolean))).sort((left, right) =>
    String(left).localeCompare(String(right)),
  )
}

function getAvailableOptions(records, filters, fieldName) {
  const otherFields = ["state", "city", "category", "size"].filter(
    (field) => field !== fieldName,
  )

  const matchingRecords = records.filter((record) =>
    otherFields.every((field) => {
      const selectedValue = filters[field]
      return (
        selectedValue === null ||
        String(record[field] ?? "").trim() === selectedValue
      )
    }),
  )

  return sortValues(matchingRecords.map((record) => record[fieldName]))
}

function buildWhereClause(filters, values) {
  const clauses = []
  const fieldMapping = [
    { key: "state", column: "s.state" },
    { key: "city", column: "s.city" },
    { key: "category", column: "p.category" },
    { key: "size", column: "p.size" },
  ]

  fieldMapping.forEach(({ key, column }) => {
    const value = normalizeFilterValue(filters[key])
    if (value !== null) {
      clauses.push(`${column} = $${values.length + 1}`)
      values.push(value)
    }
  })

  return clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : ""
}

async function fetchRecords(filters = {}) {
  const normalizedFilters = {
    state: normalizeFilterValue(filters.state),
    city: normalizeFilterValue(filters.city),
    category: normalizeFilterValue(filters.category),
    size: normalizeFilterValue(filters.size),
  }

  const values = []
  const whereClause = buildWhereClause(normalizedFilters, values)

  const rowsResult = await pool.query(
    `
    SELECT
      s.city AS city,
      s.state AS state,
      p.category AS category,
      p.size AS size,
      o.order_id AS id,
      o.total AS sales
    FROM orders o
    JOIN stores s ON s.store_id = o.store_id
    JOIN orderitems oi ON oi.order_id = o.order_id
    JOIN products p ON p.sku = oi.sku
    ${whereClause}
    ORDER BY o.order_id, s.city, p.category, p.size
  `,
    values,
  )

  return rowsResult.rows.map((row) => ({
    ...row,
    sales: Number(row.sales),
  }))
}

export async function getDefaultDateRange() {
  const result = await pool.query(`
    SELECT EXTRACT(YEAR FROM MAX(order_date))::int AS latest_year
    FROM orders
    WHERE order_date IS NOT NULL
  `)

  const latestYear = Number(
    result.rows[0]?.latest_year || new Date().getFullYear(),
  )

  return {
    startDate: `${latestYear}-01-01`,
    endDate: `${latestYear}-12-31`,
  }
}

export async function getAllTimeRange() {
  const result = await pool.query(`
    SELECT
      TO_CHAR(MIN(order_date::date), 'YYYY-MM-DD') AS earliest_date,
      TO_CHAR(MAX(order_date::date), 'YYYY-MM-DD') AS latest_date
    FROM orders
    WHERE order_date IS NOT NULL
  `)

  const earliestDate = result.rows[0]?.earliest_date ?? ""
  const latestDate = result.rows[0]?.latest_date ?? ""

  return {
    startDate: earliestDate,
    endDate: latestDate,
  }
}

export async function getFilters(filters = {}) {
  const records = await fetchRecords(filters)

  const normalizedFilters = {
    state: normalizeFilterValue(filters.state),
    city: normalizeFilterValue(filters.city),
    category: normalizeFilterValue(filters.category),
    size: normalizeFilterValue(filters.size),
  }

  const cleanedFilters = { ...normalizedFilters }
  for (const fieldName of ["state", "city", "category", "size"]) {
    const selectedValue = cleanedFilters[fieldName]
    if (selectedValue === null) continue

    const available = getAvailableOptions(records, cleanedFilters, fieldName)
    if (!available.includes(selectedValue)) {
      cleanedFilters[fieldName] = null
    }
  }

  return {
    table: "joined_sales",
    filters: cleanedFilters,
    defaultDateRange: await getDefaultDateRange(),
    filteredData: records.filter((record) =>
      Object.entries(cleanedFilters).every(([key, value]) =>
        value === null ? true : String(record[key] ?? "").trim() === value,
      ),
    ),
    cities: getAvailableOptions(records, cleanedFilters, "city"),
    states: getAvailableOptions(records, cleanedFilters, "state"),
    categories: getAvailableOptions(records, cleanedFilters, "category"),
    sizes: getAvailableOptions(records, cleanedFilters, "size"),
    availableCities: getAvailableOptions(records, cleanedFilters, "city"),
    availableStates: getAvailableOptions(records, cleanedFilters, "state"),
    availableCategories: getAvailableOptions(
      records,
      cleanedFilters,
      "category",
    ),
    availableSizes: getAvailableOptions(records, cleanedFilters, "size"),
  }
}

export async function getDependentFilters(filters = {}) {
  return getFilters(filters)
}
