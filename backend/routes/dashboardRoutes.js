import { Router } from "express"
import {
  getAllDashboardData,
  getKpiMetrics,
  getLineChartData,
  getCategoryChartData,
  getSizeChartData,
  getAreaChartData,
  getRadarChartData,
  getWeekdayChartData,
  getCoOccurrenceMatrixData,
} from "../controller/dashboardController.js"

const router = Router()

// Optimized endpoint: combines all dashboard data into single request
router.get("/all", getAllDashboardData)

// Individual endpoints (still available for backward compatibility)
router.get("/kpi", getKpiMetrics)
router.get("/chart/line", getLineChartData)
router.get("/chart/category", getCategoryChartData)
router.get("/chart/size", getSizeChartData)
router.get("/chart/area", getAreaChartData)
router.get("/chart/radar", getRadarChartData)
router.get("/chart/weekday", getWeekdayChartData)
router.get("/chart/co-occurrence", getCoOccurrenceMatrixData)

export default router
