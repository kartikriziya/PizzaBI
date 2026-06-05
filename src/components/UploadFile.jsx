import React, { useEffect, useRef, useState } from "react"

export default function UploadFile({ onUpload, accept = "*", maxFiles = 20 }) {
  const [files, setFiles] = useState([]) // { file, preview }
  const inputRef = useRef(null)

  const handleSelect = (e) => {
    const selected = Array.from(e.target.files || [])
    if (!selected.length) return

    const remaining = Math.max(0, maxFiles - files.length)
    const toAdd = selected.slice(0, remaining).map((f) => ({
      file: f,
      preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : null,
    }))

    setFiles((prev) => [...prev, ...toAdd])
    // reset input so same file can be selected again if removed
    e.target.value = ""
  }

  const handleRemove = (index) => {
    setFiles((prev) => {
      const next = [...prev]
      const removed = next.splice(index, 1)[0]
      if (removed && removed.preview) URL.revokeObjectURL(removed.preview)
      return next
    })
  }

  const handleUpload = () => {
    if (!files.length) return
    const payload = files.map((f) => f.file)
    if (onUpload) onUpload(payload)
    // default behaviour: clear list after upload
    files.forEach((f) => f.preview && URL.revokeObjectURL(f.preview))
    setFiles([])
  }

  useEffect(() => {
    return () => {
      files.forEach((f) => f.preview && URL.revokeObjectURL(f.preview))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="p-4 bg-pizzabi-card/10 rounded-md border border-pizzabi-muted/20">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        onChange={handleSelect}
        className="hidden"
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current && inputRef.current.click()}
          className="px-3 py-2 bg-pizzabi-gold text-pizzabi-main rounded shadow-sm hover:opacity-90 transition"
        >
          Select files
        </button>

        <button
          type="button"
          onClick={handleUpload}
          disabled={!files.length}
          className={`px-3 py-2 rounded shadow-sm transition ${
            files.length
              ? "bg-pizzabi-main text-pizzabi-gold"
              : "bg-gray-700/30 text-gray-400 cursor-not-allowed"
          }`}
        >
          Upload ({files.length})
        </button>
      </div>

      {files.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {files.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-2 p-2 bg-pizzabi-card/20 rounded"
            >
              {f.preview ? (
                <img
                  src={f.preview}
                  alt={f.file.name}
                  className="w-12 h-12 object-cover rounded"
                />
              ) : (
                <div className="w-12 h-12 flex items-center justify-center bg-gray-800 rounded text-xs text-pizzabi-muted">
                  {f.file.name.split(".").pop()?.toUpperCase() || "FILE"}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-pizzabi-gold truncate">
                  {f.file.name}
                </div>
                <div className="text-xs text-pizzabi-muted">
                  {(f.file.size / 1024).toFixed(1)} KB
                </div>
              </div>

              <button
                onClick={() => handleRemove(i)}
                className="p-1 text-pizzabi-gold hover:bg-pizzabi-card/40 rounded transition-colors"
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
