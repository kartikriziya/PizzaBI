import { Router } from "express"
import {
  getKpiMetrics,
  getLineChartData,
  getCategoryChartData,
  getSizeChartData,
  getAreaChartData,
  getRadarChartData,
  getWeekdayChartData,
} from "../controller/dashboardController.js"

const router = Router()

router.get("/kpi", getKpiMetrics)
router.get("/chart/line", getLineChartData)
router.get("/chart/category", getCategoryChartData)
router.get("/chart/size", getSizeChartData)
router.get("/chart/area", getAreaChartData)
router.get("/chart/radar", getRadarChartData)
router.get("/chart/weekday", getWeekdayChartData)

export default router
