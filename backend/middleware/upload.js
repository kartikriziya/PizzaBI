import multer from "multer"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Temp folder one level up from middleware/ → backend/uploads/
const uploadDir = path.join(__dirname, "..", "uploads")
fs.mkdirSync(uploadDir, { recursive: true })

const upload = multer({
  dest: uploadDir,
  fileFilter: (req, file, cb) => {
    if (!file.originalname.toLowerCase().endsWith(".csv")) {
      return cb(new Error("Only CSV files are allowed"))
    }
    cb(null, true)
  },
})

export default upload
