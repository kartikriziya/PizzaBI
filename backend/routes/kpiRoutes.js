import { Router } from "express"
import { getKpi } from "../controller/kpiController.js"

const router = Router()
router.get("/", getKpi)

export default router
