import { Router } from "express"
import {
  getFilters,
  getDefaultDateRange,
  getAllTimeRange,
} from "../controller/filterController.js"

const router = Router()

router.get("/", getFilters)
router.get("/default-range", getDefaultDateRange)
router.get("/all-time-range", getAllTimeRange)

export default router
