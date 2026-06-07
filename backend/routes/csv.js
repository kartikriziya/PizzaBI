import { Router } from "express"
import fs from "fs"
import upload from "../middleware/upload.js"
import { previewFiles, importFiles } from "../services/csvImportService.js"

const router = Router()

/**
 * POST /api/csv/preview
 * Accepts CSV files, parses them, and returns table info + warnings.
 * Does NOT write anything to the database.
 */
router.post("/preview", upload.array("files"), async (req, res) => {
  try {
    const previews = await previewFiles(req.files)
    res.json({ success: true, previews })
  } catch (err) {
    for (const file of req.files || []) fs.unlink(file.path, () => {})
    res.status(500).json({ success: false, error: err.message })
  }
})

/**
 * POST /api/csv/confirm
 * User confirmed the import — deletes old data and inserts new rows.
 * Body: { confirmedFiles: [{ tempPath, tableName, filename }] }
 */
router.post("/confirm", async (req, res) => {
  try {
    const results = await importFiles(req.body.confirmedFiles)
    res.json({ success: true, results })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/**
 * POST /api/csv/cancel
 * User dismissed the confirm dialog — clean up temp files.
 * Body: { tempPaths: string[] }
 */
router.post("/cancel", (req, res) => {
  const { tempPaths = [] } = req.body
  tempPaths.forEach((p) => fs.unlink(p, () => {}))
  res.json({ success: true })
})

export default router
