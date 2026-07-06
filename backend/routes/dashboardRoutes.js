import { Router } from "express"
import {
  getKpiMetrics,
  getLineChartData,
  getCategoryChartData,
  getSizeChartData,
  getAreaChartData,
  getRadarChartData,
  getWeekdayChartData,
  // ----- Jahn 06.07 ------
  getCoMatrixData,
  // ----- Jahn 06.07 ------
} from "../controller/dashboardController.js"

const router = Router()

router.get("/kpi", getKpiMetrics)
router.get("/chart/line", getLineChartData)
router.get("/chart/category", getCategoryChartData)
router.get("/chart/size", getSizeChartData)
router.get("/chart/area", getAreaChartData)
router.get("/chart/radar", getRadarChartData)
router.get("/chart/weekday", getWeekdayChartData)
// ----- Jahn 06.07 ------
router.get("/chart/comatrix", getCoMatrixData)
// ----- Jahn 06.07 ------

export default router
