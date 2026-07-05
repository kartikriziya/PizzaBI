import pool from "../db/index.js"

export async function getKpiData() {
  const result = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE o.order_date IS NOT NULL) AS total_orders,
      SUM(o.total)::numeric(12,2) AS total_revenue,
      AVG(o.total)::numeric(12,2) AS avg_order_value,
      COUNT(DISTINCT s.store_id) AS total_stores,
      COUNT(DISTINCT p.sku) AS total_products
    FROM orders o
    JOIN stores s ON s.store_id = o.store_id
    JOIN orderitems oi ON oi.order_id = o.order_id
    JOIN products p ON p.sku = oi.sku
  `)

  const row = result.rows[0]
  return {
    totalOrders: Number(row.total_orders || 0),
    totalRevenue: Number(row.total_revenue || 0),
    avgOrderValue: Number(row.avg_order_value || 0),
    totalStores: Number(row.total_stores || 0),
    totalProducts: Number(row.total_products || 0),
  }
}
