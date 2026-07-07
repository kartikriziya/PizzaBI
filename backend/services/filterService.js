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

/**
 * Efficiently queries available options for a specific field using SQL WHERE clause.
 * Avoids loading all rows into memory.
 */
async function getAvailableOptions(fieldName, filters) {
  const clauses = []
  const values = []
  const fieldMapping = [
    { key: "state", column: "s.state" },
    { key: "city", column: "s.city" },
    { key: "category", column: "p.category" },
    { key: "size", column: "p.size" },
    { key: "pizza", column: "p.name" },
  ]

  // Build WHERE clause for other fields
  fieldMapping.forEach(({ key, column }) => {
    if (key === fieldName) return
    const value = normalizeFilterValue(filters[key])
    if (value !== null) {
      clauses.push(`${column} = $${values.length + 1}`)
      values.push(value)
    }
  })

  const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : ""

  const result = await pool.query(
    `
    SELECT DISTINCT ${
      fieldName === "state"
        ? "s.state"
        : fieldName === "city"
          ? "s.city"
          : fieldName === "category"
            ? "p.category"
            : fieldName === "size"
              ? "p.size"
              : "p.name"
    } AS value
    FROM orders o
    JOIN stores s ON s.store_id = o.store_id
    JOIN orderitems oi ON oi.order_id = o.order_id
    JOIN products p ON p.sku = oi.sku
    ${whereClause}
    ORDER BY value
  `,
    values,
  )

  return result.rows.map((row) => row.value).filter(Boolean)
}

function buildWhereClause(filters, values) {
  const clauses = []
  const fieldMapping = [
    { key: "state", column: "s.state" },
    { key: "city", column: "s.city" },
    { key: "category", column: "p.category" },
    { key: "size", column: "p.size" },
    { key: "pizza", column: "p.name" },
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

/**
 * Fetch unique combinations of dimensions for the selected filters.
 * Only returns the unique combinations, not all individual joined rows.
 */
async function fetchFilteredDimensions(filters = {}) {
  const normalizedFilters = {
    state: normalizeFilterValue(filters.state),
    city: normalizeFilterValue(filters.city),
    category: normalizeFilterValue(filters.category),
    size: normalizeFilterValue(filters.size),
    pizza: normalizeFilterValue(filters.pizza),
  }

  const values = []
  const whereClause = buildWhereClause(normalizedFilters, values)

  const rowsResult = await pool.query(
    `
    SELECT DISTINCT
      s.city AS city,
      s.state AS state,
      p.category AS category,
      p.size AS size,
      p.name AS pizza
    FROM orders o
    JOIN stores s ON s.store_id = o.store_id
    JOIN orderitems oi ON oi.order_id = o.order_id
    JOIN products p ON p.sku = oi.sku
    ${whereClause}
    ORDER BY s.state, s.city, p.category, p.size
  `,
    values,
  )

  return rowsResult.rows
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

/**
 * Get available filter values efficiently using SQL queries.
 * Validates selected filters to ensure they're still available.
 */
export async function getFilters(filters = {}) {
  const normalizedFilters = {
    state: normalizeFilterValue(filters.state),
    city: normalizeFilterValue(filters.city),
    category: normalizeFilterValue(filters.category),
    size: normalizeFilterValue(filters.size),
    pizza: normalizeFilterValue(filters.pizza),
  }

  // Validate that selected filters are still available
  const cleanedFilters = { ...normalizedFilters }
  for (const fieldName of ["state", "city", "category", "size", "pizza"]) {
    const selectedValue = cleanedFilters[fieldName]
    if (selectedValue === null) continue

    const available = await getAvailableOptions(fieldName, cleanedFilters)
    if (!available.includes(selectedValue)) {
      cleanedFilters[fieldName] = null
    }
  }

  // Get all available options for each filter field
  const states = await getAvailableOptions("state", cleanedFilters)
  const cities = await getAvailableOptions("city", cleanedFilters)
  const categories = await getAvailableOptions("category", cleanedFilters)
  const sizes = await getAvailableOptions("size", cleanedFilters)
  const pizzas = await getAvailableOptions("pizza", cleanedFilters)

  return {
    table: "joined_sales",
    filters: cleanedFilters,
    defaultDateRange: await getDefaultDateRange(),
    filteredData: await fetchFilteredDimensions(cleanedFilters),
    cities,
    states,
    categories,
    sizes,
    pizzas,
    availableCities: cities,
    availableStates: states,
    availableCategories: categories,
    availableSizes: sizes,
    availablePizzas: pizzas,
  }
}

export async function getDependentFilters(filters = {}) {
  return getFilters(filters)
}
