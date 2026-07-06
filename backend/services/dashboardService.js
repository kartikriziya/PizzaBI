import pool from "../db/index.js"

/**
 * Clean and normalize filter values to prevent null/undefined issues.
 */
function normalizeValue(value) {
  if (value === undefined || value === null) return ""
  return String(value).trim()
}

/**
 * Combines store and date-based conditions into a structured array.
 */
function buildBaseConditions(filters) {
  const conditions = []

  const addCondition = (sql, value) => {
    const normalized = normalizeValue(value)
    if (!normalized) return
    conditions.push({ sql, value: normalized })
  }

  addCondition("stores.city = ?", filters.city)
  addCondition("stores.state = ?", filters.state)

  if (filters.startDate) {
    addCondition("orders.order_date::date >= ?", filters.startDate)
  }

  if (filters.endDate) {
    addCondition("orders.order_date::date <= ?", filters.endDate)
  }

  return conditions
}

/**
 * Combines product line items-based conditions (category, size).
 */
function buildItemConditions(filters) {
  const conditions = []

  const addCondition = (sql, value) => {
    const normalized = normalizeValue(value)
    if (!normalized) return
    conditions.push({ sql, value: normalized })
  }

  addCondition("p.category = ?", filters.category)
  addCondition("p.size = ?", filters.size)

  return conditions
}

/**
 * Dynamically replaces "?" placeholders with specific native PostgreSQL $1, $2 parameter tokens
 * and aggregates them into an adjustable starting array index tracker.
 */
function buildParameterizedClause(conditions, startIndex = 1) {
  if (conditions.length === 0) {
    return { sql: "", values: [], nextIndex: startIndex, clauses: [] }
  }

  const values = []
  const sqlClauses = []
  let currentIndex = startIndex

  conditions.forEach((condition) => {
    values.push(condition.value)
    sqlClauses.push(condition.sql.replace("?", `$${currentIndex}`))
    currentIndex += 1
  })

  return {
    clauses: sqlClauses,
    values,
    nextIndex: currentIndex,
  }
}

/**
 * Formats data deltas dynamically showing structural direction comparisons vs baseline metrics.
 */
function formatDelta(value, baseline) {
  if (baseline === 0) {
    return value === 0 ? "No change" : "▲ 100.0% vs baseline"
  }

  const change = ((value - baseline) / baseline) * 100
  const sign = change >= 0 ? "▲" : "▼"
  return `${sign} ${Math.abs(change).toFixed(1)}% vs baseline`
}

/**
 * Orchestrates unified parsing of base and item scopes while holding sequential variable indexes.
 */
export function buildFilterClause(filters) {
  const baseFilters = {
    city: filters.city || "",
    state: filters.state || "",
    category: filters.category || "",
    size: filters.size || "",
    startDate: filters.startDate || "",
    endDate: filters.endDate || "",
  }

  const orderConditions = buildBaseConditions(baseFilters)
  const itemConditions = buildItemConditions(baseFilters)

  const baseQuery = buildParameterizedClause(orderConditions, 1)
  const itemQuery = buildParameterizedClause(
    itemConditions,
    baseQuery.nextIndex,
  )

  // Consolidates multiple filter clauses smoothly into a valid SQL WHERE statement
  let whereSql = ""
  const allClauses = [...baseQuery.clauses, ...itemQuery.clauses]
  if (allClauses.length > 0) {
    whereSql = `WHERE ${allClauses.join(" AND ")}`
  }

  return {
    baseQuery,
    itemQuery,
    whereSql,
  }
}

/**
 * Fetches higher-level metric boxes matching requested parameters vs historical total baselines.
 */
export async function getKpiMetrics(filters = {}) {
  const { baseQuery, itemQuery, whereSql } = buildFilterClause(filters)

  // Checks if item scope limits exist, dynamically chaining tables when needed.
  const query = `
    SELECT
      COUNT(DISTINCT orders.order_id)::int AS order_count,
      COALESCE(SUM(orders.total), 0)::numeric AS revenue,
      COALESCE(SUM(orders.n_items), 0)::int AS pizzas_sold,
      COUNT(DISTINCT orders.customer_id)::int AS customer_count
    FROM orders
    LEFT JOIN stores ON orders.store_id = stores.store_id
    ${
      itemQuery.clauses.length > 0
        ? `
    LEFT JOIN orderitems oi ON oi.order_id = orders.order_id
    LEFT JOIN products p ON oi.sku = p.sku
    `
        : ""
    }
    ${whereSql}
  `

  const filteredResult = await pool.query(query, [
    ...baseQuery.values,
    ...itemQuery.values,
  ])
  const row = filteredResult.rows[0]

  // Baseline performance query tracking total historic numbers
  const baselineQuery = `
    SELECT
      COUNT(DISTINCT orders.order_id)::int AS order_count,
      COALESCE(SUM(orders.total), 0)::numeric AS revenue,
      COALESCE(SUM(orders.n_items), 0)::int AS pizzas_sold,
      COUNT(DISTINCT orders.customer_id)::int AS customer_count
    FROM orders
    LEFT JOIN stores ON orders.store_id = stores.store_id
  `

  const baselineResult = await pool.query(baselineQuery)
  const baselineRow = baselineResult.rows[0]

  const revenue = Number(row.revenue || 0)
  const orders = Number(row.order_count || 0)
  const pizzasSold = Number(row.pizzas_sold || 0)
  const averageOrderValue = orders === 0 ? 0 : revenue / orders
  const newCustomers = Number(row.customer_count || 0)

  const baselineRevenue = Number(baselineRow.revenue || 0)
  const baselineOrders = Number(baselineRow.order_count || 0)
  const baselinePizzas = Number(baselineRow.pizzas_sold || 0)
  const baselineAverageOrderValue =
    baselineOrders === 0 ? 0 : baselineRevenue / baselineOrders
  const baselineCustomers = Number(baselineRow.customer_count || 0)

  return {
    totalRevenue: {
      value: revenue,
      delta: formatDelta(revenue, baselineRevenue),
    },
    totalOrders: { value: orders, delta: formatDelta(orders, baselineOrders) },
    pizzasSold: {
      value: pizzasSold,
      delta: formatDelta(pizzasSold, baselinePizzas),
    },
    averageOrderValue: {
      value: averageOrderValue,
      delta: formatDelta(averageOrderValue, baselineAverageOrderValue),
    },
    newCustomers: {
      value: newCustomers,
      delta: formatDelta(newCustomers, baselineCustomers),
    },
  }
}

/**
 * Returns timeline day data for multi-line visual chart streams.
 */
export async function getLineChartData(filters = {}) {
  const { baseQuery, itemQuery, whereSql } = buildFilterClause(filters)

  const query = `
    SELECT
      TO_CHAR(orders.order_date, 'DD.MM.YYYY') AS day,
      SUM(orders.total)::numeric AS revenue,
      COUNT(DISTINCT orders.order_id)::int AS orders
    FROM orders
    LEFT JOIN stores ON orders.store_id = stores.store_id
    ${
      itemQuery.clauses.length > 0
        ? `
    LEFT JOIN orderitems oi ON oi.order_id = orders.order_id
    LEFT JOIN products p ON oi.sku = p.sku
    `
        : ""
    }
    ${whereSql}
    GROUP BY TO_CHAR(orders.order_date, 'DD.MM.YYYY')
    ORDER BY MIN(orders.order_date)
  `

  const result = await pool.query(query, [
    ...baseQuery.values,
    ...itemQuery.values,
  ])

  return result.rows.map((row) => ({
    day: row.day,
    revenue: Number(row.revenue || 0),
    orders: Number(row.orders || 0),
  }))
}

/**
 * Groups metrics to show performance distributions by pizza categories.
 */
export async function getCategoryChartData(filters = {}) {
  const { baseQuery, itemQuery, whereSql } = buildFilterClause(filters)

  const query = `
    SELECT
      p.category AS name,
      COUNT(DISTINCT orders.order_id)::int AS orders
    FROM orders
    LEFT JOIN stores ON orders.store_id = stores.store_id
    LEFT JOIN orderitems oi ON oi.order_id = orders.order_id
    LEFT JOIN products p ON oi.sku = p.sku
    ${whereSql}
    GROUP BY p.category
    ORDER BY orders DESC
  `

  const result = await pool.query(query, [
    ...baseQuery.values,
    ...itemQuery.values,
  ])

  return result.rows.map((row) => ({
    name: row.name || "Uncategorized",
    orders: Number(row.orders || 0),
  }))
}

/**
 * Generates sizing scale counts for product distributions.
 */
export async function getSizeChartData(filters = {}) {
  const { baseQuery, itemQuery, whereSql } = buildFilterClause(filters)

  const query = `
    SELECT
      p.size AS name,
      COUNT(DISTINCT orders.order_id)::int AS value
    FROM orders
    LEFT JOIN stores ON orders.store_id = stores.store_id
    LEFT JOIN orderitems oi ON oi.order_id = orders.order_id
    LEFT JOIN products p ON oi.sku = p.sku
    ${whereSql}
    GROUP BY p.size
    ORDER BY value DESC
  `

  const result = await pool.query(query, [
    ...baseQuery.values,
    ...itemQuery.values,
  ])

  return result.rows.map((row) => ({
    name: row.name || "Unknown",
    value: Number(row.value || 0),
  }))
}

/**
 * Aggregates hourly order activity for the area chart.
 */
export async function getAreaChartData(filters = {}) {
  const { baseQuery, itemQuery, whereSql } = buildFilterClause(filters)

  const query = `
    WITH hourly_orders AS (
      SELECT
        EXTRACT(HOUR FROM orders.order_date)::int AS hour,
        COUNT(DISTINCT orders.order_id)::int AS orders
      FROM orders
      LEFT JOIN stores ON orders.store_id = stores.store_id
      ${
        itemQuery.clauses.length > 0
          ? `
      LEFT JOIN orderitems oi ON oi.order_id = orders.order_id
      LEFT JOIN products p ON oi.sku = p.sku
      `
          : ""
      }
      ${whereSql}
      GROUP BY EXTRACT(HOUR FROM orders.order_date)
    )
    SELECT
      h.hour,
      COALESCE(ho.orders, 0)::int AS orders
    FROM generate_series(0, 23) AS h(hour)
    LEFT JOIN hourly_orders ho ON ho.hour = h.hour
    ORDER BY h.hour
  `

  const result = await pool.query(query, [
    ...baseQuery.values,
    ...itemQuery.values,
  ])

  return result.rows.map((row) => ({
    hour: Number(row.hour),
    orders: Number(row.orders || 0),
  }))
}

/**
 * Gathers geographic distributions mapped out by shop states.
 */
export async function getRadarChartData(filters = {}) {
  const { baseQuery, itemQuery, whereSql } = buildFilterClause(filters)

  const query = `
    SELECT
      stores.state AS region,
      COUNT(DISTINCT orders.order_id)::int AS orders
    FROM orders
    LEFT JOIN stores ON orders.store_id = stores.store_id
    ${
      itemQuery.clauses.length > 0
        ? `
    LEFT JOIN orderitems oi ON oi.order_id = orders.order_id
    LEFT JOIN products p ON oi.sku = p.sku
    `
        : ""
    }
    ${whereSql}
    GROUP BY stores.state
    ORDER BY orders DESC
  `

  const result = await pool.query(query, [
    ...baseQuery.values,
    ...itemQuery.values,
  ])

  return result.rows.map((row) => ({
    region: row.region || "Unknown",
    orders: Number(row.orders || 0),
  }))
}

/**
 * Resolves performance rates mapped out by day-of-week groupings.
 */
export async function getWeekdayChartData(filters = {}) {
  const { baseQuery, itemQuery, whereSql } = buildFilterClause(filters)

  const query = `
    SELECT
      TO_CHAR(orders.order_date, 'Dy') AS day,
      COUNT(DISTINCT orders.order_id)::int AS orders
    FROM orders
    LEFT JOIN stores ON orders.store_id = stores.store_id
    ${
      itemQuery.clauses.length > 0
        ? `
    LEFT JOIN orderitems oi ON oi.order_id = orders.order_id
    LEFT JOIN products p ON oi.sku = p.sku
    `
        : ""
    }
    ${whereSql}
    GROUP BY TO_CHAR(orders.order_date, 'Dy')
    ORDER BY MIN(orders.order_date)
  `

  const result = await pool.query(query, [
    ...baseQuery.values,
    ...itemQuery.values,
  ])

  return result.rows.map((row) => ({
    day: row.day,
    orders: Number(row.orders || 0),
  }))
}
