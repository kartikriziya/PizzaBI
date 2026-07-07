import pool from "../db/index.js"
import { buildFilterClause } from "./dashboardService.js"

export async function getKpiData(filters = {}) {
  const { baseQuery, itemQuery, whereSql } = buildFilterClause(filters)

  const query = `
    SELECT
      COUNT(DISTINCT orders.order_id)::int AS total_orders,
      COALESCE(SUM(DISTINCT orders.order_id || '|' || COALESCE(orders.total, 0))::numeric, 0) - 
        COALESCE(SUM(DISTINCT orders.order_id)::numeric, 0) AS total_revenue_calc,
      COALESCE(SUM(orders.total), 0)::numeric(12,2) AS total_revenue,
      COALESCE(AVG(orders.total), 0)::numeric(12,2) AS avg_order_value,
      COUNT(DISTINCT stores.store_id)::int AS total_stores,
      COUNT(DISTINCT products.sku)::int AS total_products
    FROM (
      SELECT DISTINCT ON (orders.order_id)
        orders.order_id,
        orders.total,
        orders.store_id,
        stores.store_id
      FROM orders
      LEFT JOIN stores ON stores.store_id = orders.store_id
      ${
        itemQuery.clauses.length > 0
          ? `
      LEFT JOIN orderitems oi ON oi.order_id = orders.order_id
      LEFT JOIN products ON products.sku = oi.sku
      `
          : ""
      }
      ${whereSql}
    ) o
    LEFT JOIN stores ON stores.store_id = o.store_id
    LEFT JOIN orderitems oi ON oi.order_id = o.order_id
    LEFT JOIN products ON products.sku = oi.sku
  `

  const result = await pool.query(query, [
    ...baseQuery.values,
    ...itemQuery.values,
  ])

  const row = result.rows[0]
  return {
    totalOrders: Number(row.total_orders || 0),
    totalRevenue: Number(row.total_revenue || 0),
    avgOrderValue: Number(row.avg_order_value || 0),
    totalStores: Number(row.total_stores || 0),
    totalProducts: Number(row.total_products || 0),
  }
}
