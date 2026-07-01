import { useRef, useEffect } from "react"
import { Check } from "lucide-react"

// Simple list dropdown used for Store, Region, Category, Size filters.
// Uses position:fixed (same as DateRangePicker) to escape overflow clipping.
export default function FilterDropdown({ options, value, onSelect, onCancel, anchor, chipRef }) {
  const containerRef = useRef(null)

  useEffect(() => {
    function handleOutside(e) {
      const insideDropdown = containerRef.current?.contains(e.target)
      const insideChip     = chipRef?.current?.contains(e.target)
      if (!insideDropdown && !insideChip) onCancel()
    }
    document.addEventListener("mousedown", handleOutside)
    return () => document.removeEventListener("mousedown", handleOutside)
  }, [onCancel, chipRef])

  const clampedLeft = Math.min(anchor.left, window.innerWidth - 216)

  return (
    <div
      ref={containerRef}
      className="fixed z-[9999] overflow-hidden rounded-xl border border-pizzabi-muted/20 bg-pizzabi-main shadow-2xl"
      style={{ top: anchor.top, left: Math.max(8, clampedLeft), minWidth: 200 }}
    >
      <div className="max-h-72 overflow-y-auto">
        {options.map((opt) => {
          const isActive = value === opt
          return (
            <button
              key={opt}
              onClick={() => onSelect(opt)}
              className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-pizzabi-gold/20 font-semibold text-pizzabi-gold"
                  : "text-pizzabi-muted hover:bg-pizzabi-card hover:text-pizzabi-foreground"
              }`}
            >
              {opt}
              {isActive && <Check size={13} className="shrink-0" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
