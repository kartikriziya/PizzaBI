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
      TO_CHAR(orders.order_date, 'DD') AS day,
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
    GROUP BY TO_CHAR(orders.order_date, 'DD')
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
 * Aggregates daily area performance structures.
 */
export async function getAreaChartData(filters = {}) {
  const { baseQuery, itemQuery, whereSql } = buildFilterClause(filters)

  const query = `
    SELECT
      TO_CHAR(orders.order_date, 'DD') AS day,
      SUM(orders.total)::numeric AS revenue
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
    GROUP BY TO_CHAR(orders.order_date, 'DD')
    ORDER BY MIN(orders.order_date)
  `

  const result = await pool.query(query, [
    ...baseQuery.values,
    ...itemQuery.values,
  ])

  return result.rows.map((row) => ({
    day: row.day,
    revenue: Number(row.revenue || 0),
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

// ----- Jahn 06.07 ------
/**
 * Computes how often pairs of the most popular products are ordered together
 * (co-occurrence), restricted to the top 8 products so the matrix stays readable.
 * Respects the same filters (city/state/category/size/date range) as every
 * other chart via buildFilterClause.
 */
export async function getCoOccurrenceMatrix(filters = {}) {
  const { baseQuery, itemQuery, whereSql } = buildFilterClause(filters)
  const filterValues = [...baseQuery.values, ...itemQuery.values]

  const filteredOrdersCte = `
    WITH filtered_orders AS (
      SELECT DISTINCT orders.order_id
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
    )
  `

  // Top 8 products (by number of distinct orders) among the filtered orders
  const topProductsResult = await pool.query(
    `${filteredOrdersCte}
     SELECT p.name AS name, COUNT(DISTINCT oi.order_id)::int AS orders
     FROM orderitems oi
     JOIN products p ON p.sku = oi.sku
     JOIN filtered_orders fo ON fo.order_id = oi.order_id
     GROUP BY p.name
     ORDER BY orders DESC
     LIMIT 8`,
    filterValues,
  )

  const products = topProductsResult.rows.map((row) => row.name).filter(Boolean)
  if (products.length === 0) {
    return { products: [], matrix: [] }
  }

  // Pairwise co-occurrence counts among those top products (self-join on orderitems,
  // oi2.sku > oi1.sku avoids double-counting a pair and excludes self-pairs)
  const pairsResult = await pool.query(
    `${filteredOrdersCte}
     SELECT p1.name AS product_a, p2.name AS product_b, COUNT(DISTINCT oi1.order_id)::int AS pair_count
     FROM orderitems oi1
     JOIN orderitems oi2 ON oi2.order_id = oi1.order_id AND oi2.sku > oi1.sku
     JOIN products p1 ON p1.sku = oi1.sku
     JOIN products p2 ON p2.sku = oi2.sku
     JOIN filtered_orders fo ON fo.order_id = oi1.order_id
     WHERE p1.name = ANY($${filterValues.length + 1})
       AND p2.name = ANY($${filterValues.length + 1})
     GROUP BY p1.name, p2.name`,
    [...filterValues, products],
  )

  const indexByName = new Map(products.map((name, i) => [name, i]))
  const matrix = products.map(() => products.map(() => 0))

  for (const row of pairsResult.rows) {
    const i = indexByName.get(row.product_a)
    const j = indexByName.get(row.product_b)
    if (i === undefined || j === undefined) continue
    const count = Number(row.pair_count)
    matrix[i][j] = count
    matrix[j][i] = count
  }

  return { products, matrix }
}
// ----- Jahn 06.07 ------
