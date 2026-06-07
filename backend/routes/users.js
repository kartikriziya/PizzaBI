import { Router } from "express"
import pool from "../db/index.js"

const router = Router()

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users")
    res.json(result.rows)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
})

export default router
