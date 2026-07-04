import { Router } from "express"
import { getKpiMetrics } from "../controller/dashboardController.js"

const router = Router()

router.get("/kpi", getKpiMetrics)

export default router
