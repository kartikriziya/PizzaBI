import React, { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import Loader from "./Loader"

const API = "http://localhost:5000/api/csv"

const getFileKey = (file) =>
  `${file.name.toLowerCase()}::${file.size}::${file.lastModified}`

// Reuses your existing UploadFile logic but wired into the CSV preview/confirm flow
export default function UploadFile({ maxFiles = 20 }) {
  const [files, setFiles] = useState([])
  const [status, setStatus] = useState("idle") // idle | uploading | confirming | importing | done | error
  const [previews, setPreviews] = useState([])
  const [results, setResults] = useState([])
  const [error, setError] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [uploadingFileName, setUploadingFileName] = useState("")
  const inputRef = useRef(null)

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () =>
      files.forEach((f) => f.preview && URL.revokeObjectURL(f.preview))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addFiles = (incoming) => {
    const csvOnly = Array.from(incoming).filter((f) =>
      f.name.toLowerCase().endsWith(".csv"),
    )
    if (!csvOnly.length) {
      setError("Please select CSV files only.")
      return
    }

    let addError = null
    setError(null)
    setFiles((prev) => {
      const existingKeys = new Set(prev.map(({ file }) => getFileKey(file)))
      const deduped = []
      const duplicates = []

      csvOnly.forEach((file) => {
        const key = getFileKey(file)
        if (existingKeys.has(key)) {
          duplicates.push(file.name)
        } else {
          existingKeys.add(key)
          deduped.push(file)
        }
      })

      const remainingSlots = Math.max(0, maxFiles - prev.length)
      const accepted = deduped.slice(0, remainingSlots)

      if (duplicates.length) {
        addError =
          duplicates.length === 1
            ? `Skipped duplicate file: ${duplicates[0]}`
            : `Skipped duplicate files: ${duplicates.join(", ")}`
      }

      if (accepted.length < deduped.length) {
        addError = addError
          ? `${addError} You can only upload up to ${maxFiles} files.`
          : `You can only upload up to ${maxFiles} files.`
      }

      return [
        ...prev,
        ...accepted.map((file) => ({
          file,
          preview: null,
          uploadStatus: "queued",
        })),
      ]
    })

    if (addError) {
      setError(addError)
    }
  }

  const handleRemove = (index) => {
    setFiles((prev) => {
      const next = [...prev]
      next.splice(index, 1)
      return next
    })
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  // ── Step 1: send files to /preview ───────────────────────────────────────

  const handlePreview = async () => {
    if (!files.length) return

    setStatus("uploading")
    setError(null)
    setPreviews([])
    setUploadingFileName("")

    const successfulPreviews = []
    const queue = [...files]

    for (let index = 0; index < queue.length; index += 1) {
      const currentFile = queue[index]
      setUploadingFileName(currentFile.file.name)
      setFiles((prev) =>
        prev.map((item, itemIndex) => ({
          ...item,
          uploadStatus:
            itemIndex === index
              ? "uploading"
              : item.uploadStatus === "uploaded"
                ? "uploaded"
                : item.uploadStatus === "failed"
                  ? "failed"
                  : "queued",
        })),
      )

      try {
        const formData = new FormData()
        formData.append("files", currentFile.file)

        const res = await fetch(`${API}/preview`, {
          method: "POST",
          body: formData,
        })
        const data = await res.json()
        if (!data.success) throw new Error(data.error)

        const preview = data.previews?.[0]
        if (preview) {
          successfulPreviews.push(preview)
        }

        setFiles((prev) =>
          prev.map((item, itemIndex) => ({
            ...item,
            uploadStatus:
              itemIndex === index
                ? "uploaded"
                : item.uploadStatus === "failed"
                  ? "failed"
                  : item.uploadStatus === "uploading"
                    ? "queued"
                    : item.uploadStatus,
          })),
        )
      } catch (err) {
        setFiles((prev) =>
          prev.map((item, itemIndex) => ({
            ...item,
            uploadStatus: itemIndex === index ? "failed" : item.uploadStatus,
          })),
        )
        setError(
          `Failed while analyzing ${currentFile.file.name}: ${err.message}`,
        )
        setStatus("error")
        setUploadingFileName("")
        return
      }
    }

    setPreviews(successfulPreviews)
    setStatus("confirming")
    setUploadingFileName("")
  }

  // ── Step 2a: user confirms → /confirm ────────────────────────────────────

  const handleConfirm = async () => {
    setStatus("importing")
    setError(null)
    setUploadingFileName("")

    try {
      const importedResults = []
      const confirmedFiles = previews.map((p) => ({
        tempPath: p.tempPath,
        tableName: p.tableName,
        filename: p.filename,
      }))

      for (const file of confirmedFiles) {
        setUploadingFileName(file.filename)
        setFiles((prev) =>
          prev.map((item) =>
            item.file.name === file.filename
              ? { ...item, uploadStatus: "importing" }
              : item,
          ),
        )

        const res = await fetch(`${API}/confirm-file`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ confirmedFile: file }),
        })
        const data = await res.json()
        if (!data.success) throw new Error(data.error)

        importedResults.push(data.result)
        setFiles((prev) =>
          prev.map((item) =>
            item.file.name === file.filename
              ? { ...item, uploadStatus: "imported" }
              : item,
          ),
        )
      }

      setResults(importedResults)
      setStatus("done")
      setFiles([])
    } catch (err) {
      setError(err.message)
      setStatus("error")
    } finally {
      setUploadingFileName("")
    }
  }

  // ── Step 2b: user cancels → /cancel ──────────────────────────────────────

  const handleCancel = async () => {
    await fetch(`${API}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tempPaths: previews.map((p) => p.tempPath) }),
    }).catch(() => {})
    setPreviews([])
    setStatus("idle")
    setUploadingFileName("")
  }

  const navigate = useNavigate()

  const handleReset = () => {
    setFiles([])
    setPreviews([])
    setResults([])
    setError(null)
    setStatus("idle")
    setUploadingFileName("")
  }

  const handleReturnToDashboard = () => {
    navigate("/")
  }

  const hasWarnings = previews.some((p) => p.tableExists)

  // ── Render: Done ──────────────────────────────────────────────────────────

  if (status === "done") {
    return (
      <div className="p-4 bg-pizzabi-card/10 rounded-md border border-pizzabi-muted/20 space-y-4">
        <div className="flex items-center gap-2 text-green-400 font-semibold">
          <span className="text-xl">✓</span> Import complete
        </div>
        <div className="space-y-2">
          {results.map((r, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2 bg-pizzabi-card/20 rounded text-sm"
            >
              <div>
                <span className="text-pizzabi-gold font-medium">
                  {r.filename}
                </span>
                <span className="text-pizzabi-muted mx-2">→</span>
                <span className="text-white font-mono">{r.tableName}</span>
                {r.tableCreated && (
                  <span className="ml-2 text-xs text-blue-400">
                    (new table)
                  </span>
                )}
              </div>
              <span className="text-green-400 font-semibold">
                {r.rowsInserted.toLocaleString()} rows
              </span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-2 bg-pizzabi-gold text-pizzabi-main rounded shadow-sm hover:opacity-90 transition text-sm"
          >
            Import more files
          </button>
          <button
            onClick={handleReturnToDashboard}
            className="px-3 py-2 bg-pizzabi-main text-pizzabi-gold rounded shadow-sm hover:opacity-90 transition text-sm"
          >
            Return to dashboard
          </button>
        </div>
      </div>
    )
  }

  // ── Render: Confirm dialog ────────────────────────────────────────────────

  if (status === "confirming" || status === "importing") {
    // Show loader while importing
    if (status === "importing") {
      return (
        <div className="space-y-3">
          <Loader
            size="lg"
            message={
              uploadingFileName
                ? `Importing ${uploadingFileName}...`
                : "Importing data..."
            }
          />
          <p className="text-sm text-pizzabi-muted text-center">
            {uploadingFileName
              ? `Currently processing ${uploadingFileName}`
              : "Preparing import..."}
          </p>
          <p className="text-xs text-pizzabi-muted text-center">
            {files.filter((item) => item.uploadStatus === "imported").length}/
            {files.length} files imported
          </p>
        </div>
      )
    }

    return (
      <div className="p-4 bg-pizzabi-card/10 rounded-md border border-pizzabi-muted/20 space-y-4">
        <h3 className="text-pizzabi-gold font-semibold text-sm">
          Review import
        </h3>

        {/* Warning banner — only shown when tables already exist */}
        {hasWarnings && (
          <div className="flex gap-3 p-3 bg-orange-950/40 border border-orange-700/50 rounded text-orange-300 text-sm">
            <span className="text-lg leading-none">⚠</span>
            <div>
              <p className="font-semibold">Existing data will be deleted</p>
              <p className="text-orange-400/80 text-xs mt-1">
                Tables marked below already exist. Confirming will{" "}
                <strong>permanently delete all current rows</strong> before
                inserting the new data.
              </p>
            </div>
          </div>
        )}

        {/* Per-file preview cards */}
        <div className="space-y-2">
          {previews.map((p, i) => (
            <div
              key={i}
              className="p-3 bg-pizzabi-card/20 rounded border border-pizzabi-muted/20 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-pizzabi-gold text-sm font-medium truncate">
                  {p.filename}
                </span>
                {p.tableExists ? (
                  <span className="text-xs px-2 py-0.5 rounded bg-orange-900/50 text-orange-300 border border-orange-700/40 whitespace-nowrap">
                    existing table
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-900/50 text-blue-300 border border-blue-700/40 whitespace-nowrap">
                    new table
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-pizzabi-muted font-mono">
                <span>
                  table: <span className="text-white">{p.tableName}</span>
                </span>
                <span>
                  columns:{" "}
                  <span className="text-white">{p.columns.length}</span>
                </span>
                <span>
                  new rows:{" "}
                  <span className="text-white">
                    {p.newRowCount.toLocaleString()}
                  </span>
                </span>
                {p.tableExists && (
                  <span>
                    deletes:{" "}
                    <span className="text-orange-300">
                      {p.existingRowCount.toLocaleString()} rows
                    </span>
                  </span>
                )}
              </div>

              {/* Column chips */}
              <div className="flex flex-wrap gap-1">
                {p.columns.slice(0, 8).map((c, ci) => (
                  <span
                    key={ci}
                    className="text-xs px-1.5 py-0.5 bg-pizzabi-card/40 text-pizzabi-muted rounded font-mono"
                  >
                    {c}
                  </span>
                ))}
                {p.columns.length > 8 && (
                  <span className="text-xs px-1.5 py-0.5 text-pizzabi-muted/50">
                    +{p.columns.length - 8} more
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={handleCancel}
            disabled={status === "importing"}
            className="flex-1 px-3 py-2 rounded border border-pizzabi-muted/30 text-pizzabi-muted hover:border-pizzabi-muted/60 transition text-sm disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={status === "importing"}
            className={`flex-1 px-3 py-2 rounded shadow-sm transition text-sm font-semibold disabled:opacity-60 ${
              hasWarnings
                ? "bg-orange-600 hover:bg-orange-500 text-white"
                : "bg-pizzabi-gold text-pizzabi-main hover:opacity-90"
            }`}
          >
            {status === "importing"
              ? "Importing…"
              : hasWarnings
                ? "⚠ Confirm & replace data"
                : "Confirm import"}
          </button>
        </div>
      </div>
    )
  }

  // ── Render: Default file picker ───────────────────────────────────────────

  return (
    <div className="p-4 bg-pizzabi-card/10 rounded-md border border-pizzabi-muted/20 space-y-3">
      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onClick={() => inputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-2 p-6 rounded border-2 border-dashed cursor-pointer transition ${
          dragging
            ? "border-pizzabi-gold bg-pizzabi-gold/5"
            : "border-pizzabi-muted/30 hover:border-pizzabi-muted/60"
        }`}
      >
        <span className="text-2xl">📂</span>
        <p className="text-sm text-pizzabi-muted text-center">
          {dragging
            ? "Drop CSV files here"
            : "Drag & drop CSV files, or click to browse"}
        </p>
        <p className="text-xs text-pizzabi-muted/50">Up to {maxFiles} files</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".csv"
        onChange={(e) => {
          addFiles(e.target.files)
          e.target.value = ""
        }}
        className="hidden"
      />

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={status === "uploading"}
          className="px-3 py-2 bg-pizzabi-gold text-pizzabi-main rounded shadow-sm hover:opacity-90 transition text-sm disabled:opacity-40"
        >
          Select files
        </button>
        <button
          type="button"
          onClick={handlePreview}
          disabled={!files.length || status === "uploading"}
          className={`px-3 py-2 rounded shadow-sm transition text-sm ${
            files.length && status !== "uploading"
              ? "bg-pizzabi-main text-pizzabi-gold hover:opacity-90"
              : "bg-gray-700/30 text-gray-400 cursor-not-allowed"
          }`}
        >
          {status === "uploading" ? "Analyzing…" : `Upload (${files.length})`}
        </button>
      </div>

      {/* Loader while uploading */}
      {status === "uploading" && (
        <div className="space-y-2">
          <Loader
            size="md"
            message={
              uploadingFileName
                ? `Analyzing ${uploadingFileName}...`
                : "Analyzing CSV files..."
            }
          />
          <p className="text-xs text-pizzabi-muted">
            {files.filter((item) => item.uploadStatus === "uploaded").length}/
            {files.length} files uploaded • currently processing{" "}
            {uploadingFileName}
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-2 bg-red-950/40 border border-red-700/40 rounded text-red-300 text-xs">
          <span>⚠</span> {error}
        </div>
      )}

      {/* File list — matches your existing grid style */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-pizzabi-muted">
            <span>Selected files</span>
            <span>
              {files.filter((item) => item.uploadStatus === "uploaded").length}/
              {files.length} uploaded
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {files.map((f, i) => {
              const uploadLabel =
                f.uploadStatus === "uploading"
                  ? "Uploading..."
                  : f.uploadStatus === "uploaded"
                    ? "Uploaded"
                    : f.uploadStatus === "failed"
                      ? "Failed"
                      : "Queued"

              const uploadClass =
                f.uploadStatus === "uploaded"
                  ? "bg-green-900/50 text-green-300"
                  : f.uploadStatus === "uploading"
                    ? "bg-blue-900/50 text-blue-300"
                    : f.uploadStatus === "failed"
                      ? "bg-red-900/50 text-red-300"
                      : "bg-pizzabi-card/40 text-pizzabi-muted"

              return (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2 bg-pizzabi-card/20 rounded"
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-gray-800 rounded text-xs text-pizzabi-muted shrink-0">
                    CSV
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-pizzabi-gold truncate">
                      {f.file.name}
                    </div>
                    <div className="text-xs text-pizzabi-muted">
                      {(f.file.size / 1024).toFixed(1)} KB
                    </div>
                    <div
                      className={`mt-1 inline-flex text-[10px] px-2 py-0.5 rounded ${uploadClass}`}
                    >
                      {uploadLabel}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(i)}
                    className="p-1 text-pizzabi-gold hover:bg-pizzabi-card/40 rounded transition-colors shrink-0"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
