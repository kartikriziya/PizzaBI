import { getKpiData } from "../services/kpiService.js"

export async function getKpi(req, res) {
  try {
    const kpi = await getKpiData(req.query)
    res.json(kpi)
  } catch (err) {
    console.error("[kpi] request failed", err)
    res.status(500).json({ message: "Server Error" })
  }
}
