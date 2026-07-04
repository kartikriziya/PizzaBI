import pool from "../db/index.js"

function normalizeValue(value) {
  if (value === undefined || value === null) return ""
  const text = String(value).trim()
  return text
}

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
    addCondition("orders.order_date >= ?", filters.startDate)
  }

  if (filters.endDate) {
    addCondition("orders.order_date <= ?", filters.endDate)
  }

  return conditions
}

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

function buildParameterizedClause(conditions, startIndex = 1) {
  if (conditions.length === 0) {
    return { sql: "", values: [], nextIndex: startIndex }
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
    sql: `WHERE ${sqlClauses.join(" AND ")}`,
    values,
    nextIndex: currentIndex,
  }
}

function formatDelta(value, baseline) {
  if (baseline === 0) {
    return value === 0 ? "No change" : "▲ 100.0% vs baseline"
  }

  const change = ((value - baseline) / baseline) * 100
  const sign = change >= 0 ? "▲" : "▼"
  return `${sign} ${Math.abs(change).toFixed(1)}% vs baseline`
}

function buildFilterClause(filters) {
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

  const baseQuery = buildParameterizedClause(orderConditions)
  const itemQuery = buildParameterizedClause(
    itemConditions,
    baseQuery.nextIndex,
  )

  return { baseQuery, itemQuery }
}

export async function getKpiMetrics(filters = {}) {
  const { baseQuery, itemQuery } = buildFilterClause(filters)

  const query = `
    SELECT
      COUNT(DISTINCT orders.order_id)::int AS order_count,
      COALESCE(SUM(orders.total), 0)::numeric AS revenue,
      COALESCE(SUM(item_counts.item_count), 0)::int AS pizzas_sold,
      COUNT(DISTINCT orders.customer_id)::int AS customer_count
    FROM orders
    LEFT JOIN stores ON orders.store_id = stores.store_id
    LEFT JOIN (
      SELECT oi.order_id, COUNT(*)::int AS item_count
      FROM orderitems oi
      LEFT JOIN products p ON oi.sku = p.sku
      ${itemQuery.sql}
      GROUP BY oi.order_id
    ) item_counts ON item_counts.order_id = orders.order_id
    ${baseQuery.sql}
  `

  const filteredResult = await pool.query(query, [
    ...baseQuery.values,
    ...itemQuery.values,
  ])
  const row = filteredResult.rows[0]

  const baselineQuery = `
    SELECT
      COUNT(DISTINCT orders.order_id)::int AS order_count,
      COALESCE(SUM(orders.total), 0)::numeric AS revenue,
      COALESCE(SUM(item_counts.item_count), 0)::int AS pizzas_sold,
      COUNT(DISTINCT orders.customer_id)::int AS customer_count
    FROM orders
    LEFT JOIN stores ON orders.store_id = stores.store_id
    LEFT JOIN (
      SELECT oi.order_id, COUNT(*)::int AS item_count
      FROM orderitems oi
      LEFT JOIN products p ON oi.sku = p.sku
      GROUP BY oi.order_id
    ) item_counts ON item_counts.order_id = orders.order_id
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
    totalOrders: {
      value: orders,
      delta: formatDelta(orders, baselineOrders),
    },
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

export async function getLineChartData(filters = {}) {
  const { baseQuery, itemQuery } = buildFilterClause(filters)

  const query = `
    SELECT
      TO_CHAR(orders.order_date, 'DD') AS day,
      SUM(orders.total)::numeric AS revenue,
      COUNT(DISTINCT orders.order_id)::int AS orders
    FROM orders
    LEFT JOIN stores ON orders.store_id = stores.store_id
    LEFT JOIN (
      SELECT oi.order_id
      FROM orderitems oi
      LEFT JOIN products p ON oi.sku = p.sku
      ${itemQuery.sql}
      GROUP BY oi.order_id
    ) item_counts ON item_counts.order_id = orders.order_id
    ${baseQuery.sql}
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

export async function getCategoryChartData(filters = {}) {
  const { baseQuery, itemQuery } = buildFilterClause(filters)

  const query = `
    SELECT
      p.category AS name,
      COUNT(DISTINCT orders.order_id)::int AS orders
    FROM orders
    LEFT JOIN stores ON orders.store_id = stores.store_id
    LEFT JOIN orderitems oi ON oi.order_id = orders.order_id
    LEFT JOIN products p ON oi.sku = p.sku
    ${itemQuery.sql}
    ${baseQuery.sql}
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

export async function getSizeChartData(filters = {}) {
  const { baseQuery, itemQuery } = buildFilterClause(filters)

  const query = `
    SELECT
      p.size AS name,
      COUNT(DISTINCT orders.order_id)::int AS value
    FROM orders
    LEFT JOIN stores ON orders.store_id = stores.store_id
    LEFT JOIN orderitems oi ON oi.order_id = orders.order_id
    LEFT JOIN products p ON oi.sku = p.sku
    ${itemQuery.sql}
    ${baseQuery.sql}
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

export async function getAreaChartData(filters = {}) {
  const { baseQuery, itemQuery } = buildFilterClause(filters)

  const query = `
    SELECT
      TO_CHAR(orders.order_date, 'DD') AS day,
      SUM(orders.total)::numeric AS revenue
    FROM orders
    LEFT JOIN stores ON orders.store_id = stores.store_id
    LEFT JOIN (
      SELECT oi.order_id
      FROM orderitems oi
      LEFT JOIN products p ON oi.sku = p.sku
      ${itemQuery.sql}
      GROUP BY oi.order_id
    ) item_counts ON item_counts.order_id = orders.order_id
    ${baseQuery.sql}
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

export async function getRadarChartData(filters = {}) {
  const { baseQuery, itemQuery } = buildFilterClause(filters)

  const query = `
    SELECT
      stores.state AS region,
      COUNT(DISTINCT orders.order_id)::int AS orders
    FROM orders
    LEFT JOIN stores ON orders.store_id = stores.store_id
    LEFT JOIN (
      SELECT oi.order_id
      FROM orderitems oi
      LEFT JOIN products p ON oi.sku = p.sku
      ${itemQuery.sql}
      GROUP BY oi.order_id
    ) item_counts ON item_counts.order_id = orders.order_id
    ${baseQuery.sql}
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

export async function getWeekdayChartData(filters = {}) {
  const { baseQuery, itemQuery } = buildFilterClause(filters)

  const query = `
    SELECT
      TO_CHAR(orders.order_date, 'Dy') AS day,
      COUNT(DISTINCT orders.order_id)::int AS orders
    FROM orders
    LEFT JOIN stores ON orders.store_id = stores.store_id
    LEFT JOIN (
      SELECT oi.order_id
      FROM orderitems oi
      LEFT JOIN products p ON oi.sku = p.sku
      ${itemQuery.sql}
      GROUP BY oi.order_id
    ) item_counts ON item_counts.order_id = orders.order_id
    ${baseQuery.sql}
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

export async function getTreemapChartData(filters = {}) {
  const { baseQuery, itemQuery } = buildFilterClause(filters)

  const query = `
    SELECT
      p.category AS name,
      COUNT(DISTINCT orders.order_id)::int AS value
    FROM orders
    LEFT JOIN stores ON orders.store_id = stores.store_id
    LEFT JOIN orderitems oi ON oi.order_id = orders.order_id
    LEFT JOIN products p ON oi.sku = p.sku
    ${itemQuery.sql}
    ${baseQuery.sql}
    GROUP BY p.category
    ORDER BY value DESC
  `

  const result = await pool.query(query, [
    ...baseQuery.values,
    ...itemQuery.values,
  ])

  return result.rows.map((row) => ({
    name: row.name || "Uncategorized",
    value: Number(row.value || 0),
  }))
}
