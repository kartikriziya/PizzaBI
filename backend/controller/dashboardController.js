import {
  getKpiMetrics as fetchKpiMetrics,
  getLineChartData as fetchLineChartData,
  getCategoryChartData as fetchCategoryChartData,
  getSizeChartData as fetchSizeChartData,
  getAreaChartData as fetchAreaChartData,
  getRadarChartData as fetchRadarChartData,
  getWeekdayChartData as fetchWeekdayChartData,
  getAllDashboardData as fetchAllDashboardData,
} from "../services/dashboardService.js"

export async function getAllDashboardData(req, res) {
  try {
    const data = await fetchAllDashboardData(req.query)
    res.json(data)
  } catch (error) {
    console.error("[dashboard] combined data request failed", error)
    res.status(500).json({ error: "Unable to load dashboard data." })
  }
}

export async function getKpiMetrics(req, res) {
  try {
    const metrics = await fetchKpiMetrics(req.query)
    res.json(metrics)
  } catch (error) {
    console.error("[dashboard] KPI request failed", error)
    res.status(500).json({ error: "Unable to load KPI metrics." })
  }
}

export async function getLineChartData(req, res) {
  try {
    const data = await fetchLineChartData(req.query)
    res.json(data)
  } catch (error) {
    console.error("[dashboard] line chart request failed", error)
    res.status(500).json({ error: "Unable to load line chart data." })
  }
}

export async function getCategoryChartData(req, res) {
  try {
    const data = await fetchCategoryChartData(req.query)
    res.json(data)
  } catch (error) {
    console.error("[dashboard] category chart request failed", error)
    res.status(500).json({ error: "Unable to load category chart data." })
  }
}

export async function getSizeChartData(req, res) {
  try {
    const data = await fetchSizeChartData(req.query)
    res.json(data)
  } catch (error) {
    console.error("[dashboard] size chart request failed", error)
    res.status(500).json({ error: "Unable to load size chart data." })
  }
}

export async function getAreaChartData(req, res) {
  try {
    const data = await fetchAreaChartData(req.query)
    res.json(data)
  } catch (error) {
    console.error("[dashboard] area chart request failed", error)
    res.status(500).json({ error: "Unable to load area chart data." })
  }
}

export async function getRadarChartData(req, res) {
  try {
    const data = await fetchRadarChartData(req.query)
    res.json(data)
  } catch (error) {
    console.error("[dashboard] radar chart request failed", error)
    res.status(500).json({ error: "Unable to load radar chart data." })
  }
}

export async function getWeekdayChartData(req, res) {
  try {
    const data = await fetchWeekdayChartData(req.query)
    res.json(data)
  } catch (error) {
    console.error("[dashboard] weekday chart request failed", error)
    res.status(500).json({ error: "Unable to load weekday chart data." })
  }
}
