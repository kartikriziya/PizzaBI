import { getFilters as fetchFilters } from "../services/filterService.js"

export async function getFilters(req, res) {
  try {
    const filters = req.query
    const result = await fetchFilters(filters)
    res.json(result)
  } catch (err) {
    console.error("[filters] request failed", err)
    res.status(500).json({
      message: "Server Error",
    })
  }
}
