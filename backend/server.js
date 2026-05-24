import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import pool from "./db/index.js"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

// Test route
app.get("/", (req, res) => {
  res.send("PERN Backend Running 🚀")
})

// Example: Get all users
app.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users")
    res.json(result.rows)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
