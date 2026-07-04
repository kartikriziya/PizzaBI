import { useState } from "react"

// ── tokens ────────────────────────────────────────────────────────────────────
const C = {
  bg: "#13151f",
  card: "#1e2235",
  border: "#252840",
  orange: "#f5a623",
  red: "#e84040",
  muted: "#6b7280",
  text: "#e5e7eb",
  sub: "#9ca3af",
}

function Icon({ d, size = 14, color = "currentColor" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  )
}

// ── active filter pill ────────────────────────────────────────────────────────
function Pill({ label, onRemove }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-[3px] rounded-full text-[11px] font-medium"
      style={{
        background: "#252840",
        color: C.orange,
        border: `1px solid ${C.orange}33`,
      }}
    >
      {label}
      <button
        onClick={onRemove}
        className="ml-0.5 leading-none opacity-60 hover:opacity-100 transition-opacity"
      >
        ×
      </button>
    </span>
  )
}

// ── single dropdown filter ────────────────────────────────────────────────────
function FilterDropdown({ icon, label, value, options, onChange }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all hover:opacity-90"
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          color: C.sub,
        }}
      >
        <Icon d={icon} size={11} color={C.orange} />
        <span style={{ color: C.muted }}>{label}</span>
        <span className="font-medium ml-0.5" style={{ color: C.text }}>
          {value}
        </span>
        <Icon d="M6 9l6 6 6-6" size={10} color={C.muted} />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1 z-50 py-1 rounded-xl shadow-2xl min-w-[140px]"
          style={{ background: "#1e2235", border: `1px solid ${C.border}` }}
        >
          {options.map((opt) => (
            <button
              key={opt}
              className="w-full text-left px-3 py-1.5 text-xs hover:opacity-80 transition-opacity"
              style={{ color: value === opt ? C.orange : C.sub }}
              onClick={() => {
                onChange(opt)
                setOpen(false)
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── FILTER CONFIG — edit options here ─────────────────────────────────────────
const FILTER_CONFIG = [
  {
    key: "dateRange",
    label: "Date Range",
    icon: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
    defaultValue: "May 1 – May 31, 2024",
    options: [
      "May 1 – May 31, 2024",
      "Apr 1 – Apr 30, 2024",
      "Mar 1 – Mar 31, 2024",
    ],
  },
  {
    key: "store",
    label: "Store",
    icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
    defaultValue: "Stockton",
    options: [
      "Stockton",
      "Downtown",
      "City Center",
      "Westside",
      "North Point",
      "East End",
    ],
  },
  {
    key: "region",
    label: "Region",
    icon: "M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z",
    defaultValue: "All",
    options: ["All", "North", "South", "East", "West"],
  },
  {
    key: "category",
    label: "Category",
    icon: "M12 2a10 10 0 100 20A10 10 0 0012 2z",
    defaultValue: "All",
    options: ["All", "Classic", "Vegetarian", "Specialty"],
  },
  {
    key: "size",
    label: "Size",
    icon: "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
    defaultValue: "All",
    options: ["All", "Small", "Medium", "Large", "Extra Large"],
  },
  {
    key: "launch",
    label: "Launch Period",
    icon: "M22 12h-4l-3 9L9 3l-3 9H2",
    defaultValue: "All",
    options: ["All", "Q1", "Q2", "Q3", "Q4"],
  },
]

// ── Header ────────────────────────────────────────────────────────────────────
/**
 * Props
 * ─────
 * title       : string                  – page title (default "Pizza Sales Overview")
 * subtitle    : string                  – subtitle line
 * filters     : Record<string, string>  – controlled filter state
 * onFiltersChange: (filters) => void    – called with full updated filters object
 */
export default function SampleHeader({
  title = "Pizza Sales Filters",
  subtitle = "Track key metrics and performance insights across all stores.",
  filters: externalFilters,
  onFiltersChange,
}) {
  // internal fallback state
  const [internalFilters, setInternalFilters] = useState(
    Object.fromEntries(FILTER_CONFIG.map((f) => [f.key, f.defaultValue])),
  )

  const filters = externalFilters ?? internalFilters

  const setFilter = (key, value) => {
    const next = { ...filters, [key]: value }
    if (onFiltersChange) onFiltersChange(next)
    else setInternalFilters(next)
  }

  const clearAll = () => {
    const reset = Object.fromEntries(
      FILTER_CONFIG.map((f) => [f.key, f.defaultValue]),
    )
    if (onFiltersChange) onFiltersChange(reset)
    else setInternalFilters(reset)
  }

  // pills = filters that differ from their defaultValue
  const activePills = FILTER_CONFIG.filter(
    (f) => filters[f.key] && filters[f.key] !== f.defaultValue,
  )

  return (
    <header
      className="flex-shrink-0 px-6 py-4"
      style={{
        background: C.bg,
        borderBottom: `1px solid ${C.border}`,
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      {/* title row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-lg font-bold tracking-tight"
            style={{ color: C.text }}
          >
            {title}
          </h1>
          <p className="text-xs mt-0.5" style={{ color: C.muted }}>
            {subtitle}
          </p>
        </div>

        <button
          onClick={clearAll}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg flex-shrink-0 hover:opacity-80 transition-opacity"
          style={{
            background: `${C.red}1a`,
            color: C.red,
            border: `1px solid ${C.red}33`,
          }}
        >
          <Icon d="M18 6L6 18M6 6l12 12" size={11} color={C.red} />
          Clear All Filters
        </button>
      </div>

      {/* filter dropdowns */}
      <div className="flex flex-wrap gap-2 mt-3">
        {FILTER_CONFIG.map((f) => (
          <FilterDropdown
            key={f.key}
            icon={f.icon}
            label={f.label}
            value={filters[f.key] ?? f.defaultValue}
            options={f.options}
            onChange={(val) => setFilter(f.key, val)}
          />
        ))}
      </div>

      {/* active pills */}
      {activePills.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span className="text-[11px]" style={{ color: C.muted }}>
            Active Filters:
          </span>
          {activePills.map((f) => (
            <Pill
              key={f.key}
              label={`${f.label}: ${filters[f.key]}`}
              onRemove={() => setFilter(f.key, f.defaultValue)}
            />
          ))}
        </div>
      )}
    </header>
  )
}
