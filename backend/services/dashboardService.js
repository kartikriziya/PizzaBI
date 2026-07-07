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
 * Note: Cast is applied to the parameter, not the column, to preserve index usage
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
    // Cast applied to parameter, not column, to allow index usage on order_date
    addCondition("orders.order_date >= ?::date", filters.startDate)
  }

  if (filters.endDate) {
    // Cast applied to parameter, not column, to allow index usage on order_date
    addCondition("orders.order_date <= ?::date", filters.endDate)
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
  addCondition("p.name = ?", filters.pizza)

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
    pizza: filters.pizza || "",
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
 * OPTIMIZED: Uses a single query with CTEs to get both filtered and baseline metrics in one pass.
 */
export async function getKpiMetrics(filters = {}) {
  const { baseQuery, itemQuery, whereSql } = buildFilterClause(filters)

  // Single optimized query using CTEs to get both filtered and baseline metrics
  const query = `
    WITH filtered_metrics AS (
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
    ),
    baseline_metrics AS (
      SELECT
        COUNT(DISTINCT orders.order_id)::int AS order_count,
        COALESCE(SUM(orders.total), 0)::numeric AS revenue,
        COALESCE(SUM(orders.n_items), 0)::int AS pizzas_sold,
        COUNT(DISTINCT orders.customer_id)::int AS customer_count
      FROM orders
      LEFT JOIN stores ON orders.store_id = stores.store_id
    )
    SELECT
      filtered_metrics.order_count AS filtered_order_count,
      filtered_metrics.revenue AS filtered_revenue,
      filtered_metrics.pizzas_sold AS filtered_pizzas_sold,
      filtered_metrics.customer_count AS filtered_customer_count,
      baseline_metrics.order_count AS baseline_order_count,
      baseline_metrics.revenue AS baseline_revenue,
      baseline_metrics.pizzas_sold AS baseline_pizzas_sold,
      baseline_metrics.customer_count AS baseline_customer_count
    FROM filtered_metrics
    CROSS JOIN baseline_metrics
  `

  const result = await pool.query(query, [
    ...baseQuery.values,
    ...itemQuery.values,
  ])
  const row = result.rows[0]

  const revenue = Number(row.filtered_revenue || 0)
  const orders = Number(row.filtered_order_count || 0)
  const pizzasSold = Number(row.filtered_pizzas_sold || 0)
  const averageOrderValue = orders === 0 ? 0 : revenue / orders
  const newCustomers = Number(row.filtered_customer_count || 0)

  const baselineRevenue = Number(row.baseline_revenue || 0)
  const baselineOrders = Number(row.baseline_order_count || 0)
  const baselinePizzas = Number(row.baseline_pizzas_sold || 0)
  const baselineAverageOrderValue =
    baselineOrders === 0 ? 0 : baselineRevenue / baselineOrders
  const baselineCustomers = Number(row.baseline_customer_count || 0)

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
 * FIXED: Uses subquery to avoid revenue inflation from orderitems joins
 */
export async function getLineChartData(filters = {}) {
  const { baseQuery, itemQuery, whereSql } = buildFilterClause(filters)

  const query = `
    SELECT
      TO_CHAR(day, 'DD.MM.YYYY') AS day,
      SUM(revenue)::numeric AS revenue,
      SUM(orders)::int AS orders
    FROM (
      SELECT DISTINCT ON (orders.order_id)
        orders.order_date AS day,
        orders.total AS revenue,
        1::int AS orders
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
    ) daily_data
    GROUP BY TO_CHAR(day, 'DD.MM.YYYY')
    ORDER BY MIN(day)
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
 * FIXED: Uses subquery to avoid order multiplication from orderitems joins
 */
export async function getCategoryChartData(filters = {}) {
  const { baseQuery, itemQuery, whereSql } = buildFilterClause(filters)

  const whereClause = whereSql
    ? `${whereSql} AND p.category IS NOT NULL`
    : `WHERE p.category IS NOT NULL`

  const query = `
    SELECT
      category AS name,
      COUNT(*)::int AS orders
    FROM (
      SELECT DISTINCT
        orders.order_id,
        p.category
      FROM orders
      LEFT JOIN stores ON orders.store_id = stores.store_id
      LEFT JOIN orderitems oi ON oi.order_id = orders.order_id
      LEFT JOIN products p ON oi.sku = p.sku
      ${whereClause}
    ) category_data
    GROUP BY category
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
 * FIXED: Uses subquery to avoid order multiplication from orderitems joins
 */
export async function getSizeChartData(filters = {}) {
  const { baseQuery, itemQuery, whereSql } = buildFilterClause(filters)

  const whereClause = whereSql
    ? `${whereSql} AND p.size IS NOT NULL`
    : `WHERE p.size IS NOT NULL`

  const query = `
    SELECT
      size AS name,
      COUNT(*)::int AS value
    FROM (
      SELECT DISTINCT
        orders.order_id,
        p.size
      FROM orders
      LEFT JOIN stores ON orders.store_id = stores.store_id
      LEFT JOIN orderitems oi ON oi.order_id = orders.order_id
      LEFT JOIN products p ON oi.sku = p.sku
      ${whereClause}
    ) size_data
    GROUP BY size
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
 * OPTIMIZED: Uses subquery to ensure distinct orders before aggregation
 */
export async function getAreaChartData(filters = {}) {
  const { baseQuery, itemQuery, whereSql } = buildFilterClause(filters)

  const query = `
    WITH hourly_orders AS (
      SELECT
        EXTRACT(HOUR FROM order_date)::int AS hour,
        COUNT(*)::int AS orders
      FROM (
        SELECT DISTINCT ON (orders.order_id)
          orders.order_id,
          orders.order_date
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
      ) distinct_orders
      GROUP BY EXTRACT(HOUR FROM order_date)
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
 * OPTIMIZED: Uses subquery to ensure distinct orders before aggregation
 */
export async function getRadarChartData(filters = {}) {
  const { baseQuery, itemQuery, whereSql } = buildFilterClause(filters)

  const query = `
    SELECT
      region,
      COUNT(*)::int AS orders
    FROM (
      SELECT DISTINCT
        orders.order_id,
        stores.state AS region
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
    ) region_data
    GROUP BY region
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
 * OPTIMIZED: Uses subquery to ensure distinct orders before aggregation
 */
export async function getWeekdayChartData(filters = {}) {
  const { baseQuery, itemQuery, whereSql } = buildFilterClause(filters)

  const query = `
    SELECT
      day,
      COUNT(*)::int AS orders
    FROM (
      SELECT DISTINCT ON (orders.order_id)
        orders.order_id,
        TO_CHAR(orders.order_date, 'Dy') AS day,
        orders.order_date
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
    ) weekday_data
    GROUP BY day
    ORDER BY MIN(order_date)
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

export async function getCoOccurrenceMatrixData(filters = {}) {
  const { baseQuery, itemQuery, whereSql } = buildFilterClause(filters)

  const whereClause = whereSql
    ? `${whereSql} AND p.name IS NOT NULL`
    : `WHERE p.name IS NOT NULL`

  const query = `
    WITH order_pizzas AS (
      SELECT DISTINCT
        orders.order_id,
        TRIM(p.name) AS pizza_name
      FROM orders
      LEFT JOIN stores ON orders.store_id = stores.store_id
      LEFT JOIN orderitems oi ON oi.order_id = orders.order_id
      LEFT JOIN products p ON oi.sku = p.sku
      ${whereClause}
    ),
    pair_counts AS (
      SELECT
        a.pizza_name AS pizza_x,
        b.pizza_name AS pizza_y,
        COUNT(*)::int AS value
      FROM order_pizzas a
      JOIN order_pizzas b
        ON a.order_id = b.order_id
       AND a.pizza_name < b.pizza_name
      GROUP BY a.pizza_name, b.pizza_name
    )
    SELECT
      pizza_x,
      pizza_y,
      value
    FROM pair_counts
    ORDER BY value DESC, pizza_x, pizza_y
  `

  const result = await pool.query(query, [
    ...baseQuery.values,
    ...itemQuery.values,
  ])

  const pizzaNames = [
    ...new Set(result.rows.flatMap((row) => [row.pizza_x, row.pizza_y])),
  ].sort()

  const indexByName = Object.fromEntries(
    pizzaNames.map((name, index) => [name, index]),
  )

  const matrix = Array.from({ length: pizzaNames.length }, () =>
    Array(pizzaNames.length).fill(0),
  )

  result.rows.forEach((row) => {
    const x = indexByName[row.pizza_x]
    const y = indexByName[row.pizza_y]
    const value = Number(row.value || 0)

    if (x !== undefined && y !== undefined) {
      matrix[y][x] = value
      matrix[x][y] = value
    }
  })

  return {
    pizzas: pizzaNames,
    matrix,
  }
}

/**
 * OPTIMIZED: Combines all dashboard data into a single function call.
 * Runs all required queries in parallel to minimize database round-trips.
 * This reduces API calls from 7+ to just 1-2 per page load.
 */
export async function getAllDashboardData(filters = {}) {
  const [
    kpiMetrics,
    lineData,
    categoryData,
    sizeData,
    areaData,
    radarData,
    weekdayData,
  ] = await Promise.all([
    getKpiMetrics(filters),
    getLineChartData(filters),
    getCategoryChartData(filters),
    getSizeChartData(filters),
    getAreaChartData(filters),
    getRadarChartData(filters),
    getWeekdayChartData(filters),
  ])

  return {
    kpiMetrics,
    lineChartData: lineData,
    categoryChartData: categoryData,
    sizeChartData: sizeData,
    areaChartData: areaData,
    radarChartData: radarData,
    weekdayChartData: weekdayData,
  }
}
