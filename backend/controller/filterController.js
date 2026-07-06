import {
  getFilters as fetchFilters,
  getDefaultDateRange as fetchDefaultDateRange,
} from "../services/filterService.js"

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

export async function getDefaultDateRange(req, res) {
  try {
    const result = await fetchDefaultDateRange()
    res.json(result)
  } catch (err) {
    console.error("[filters] default date range request failed", err)
    res.status(500).json({ message: "Server Error" })
  }
}
