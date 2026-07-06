import { Router } from "express"
import {
  getFilters,
  getDefaultDateRange,
} from "../controller/filterController.js"

const router = Router()

router.get("/", getFilters)
router.get("/default-range", getDefaultDateRange)

export default router
