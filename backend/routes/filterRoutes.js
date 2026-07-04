import { Router } from "express"
import { getFilters } from "../controller/filterController.js"

const router = Router()

router.get("/", getFilters)

export default router
