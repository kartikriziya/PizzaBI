import { getFilters as fetchFilters } from "../services/filterService.js"

export async function getFilters(req, res) {
  try {
    console.log("[filters] request received", req.originalUrl)
    const filters = await fetchFilters()
    console.log("[filters] sending response", filters)
    res.json(filters)
  } catch (err) {
    console.error("[filters] request failed", err)
    res.status(500).json({
      message: "Server Error",
    })
  }
}
