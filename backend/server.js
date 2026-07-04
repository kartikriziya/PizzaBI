import express from "express"
import cors from "cors"
import dotenv from "dotenv"

import csvRoutes from "./routes/csv.js"
import filterRoutes from "./routes/filterRoutes.js"
import userRoutes from "./routes/users.js"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// ── Routes ────────────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.send("PERN Backend Running 🚀"))
app.use("/users", userRoutes)
app.use("/api/csv", csvRoutes)
app.use("/api/filters", filterRoutes)

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
