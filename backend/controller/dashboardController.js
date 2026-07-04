import { getKpiMetrics as fetchKpiMetrics } from "../services/dashboardService.js"

export async function getKpiMetrics(req, res) {
  try {
    const metrics = await fetchKpiMetrics(req.query)
    res.json(metrics)
  } catch (error) {
    console.error("[dashboard] KPI request failed", error)
    res.status(500).json({ error: "Unable to load KPI metrics." })
  }
}
