import { useState, useRef } from "react"
import { Calendar, Home, Globe, Tag, Circle, ChevronDown, X } from "lucide-react"
import DateRangePicker from "./DateRangePicker"
import FilterDropdown from "./FilterDropdown"

function buildLast30Days() {
  const end = new Date()
  end.setHours(0, 0, 0, 0)
  const start = new Date(end)
  start.setDate(start.getDate() - 29)
  return { start, end, label: "Letzte 30 Tage" }
}

const FILTER_CONFIG = [
  {
    id: "store",
    label: "Store",
    icon: Home,
    iconColor: "text-pizzabi-muted",
    options: ["All", "City Center", "Downtown", "Airport", "Mall", "Westside"],
  },
  {
    id: "region",
    label: "Region",
    icon: Globe,
    iconColor: "text-pizzabi-muted",
    options: ["All", "Nord", "Süd", "Ost", "West", "Zentrum"],
  },
  {
    id: "category",
    label: "Category",
    icon: Tag,
    iconColor: "text-pizzabi-muted",
    options: [
      "All", "Pepperoni", "Hawaii", "Margherita", "Salami",
      "Veggie", "BBQ Chicken", "Vier Käse", "Tonno",
    ],
  },
  {
    id: "size",
    label: "Size",
    icon: Circle,
    iconColor: "text-pizzabi-muted",
    options: ["All", "S (25 cm)", "M (32 cm)", "L (40 cm)", "XL (48 cm)"],
  },
]

const INITIAL_FILTER_VALUES = Object.fromEntries(FILTER_CONFIG.map((f) => [f.id, "All"]))

function ActiveTag({ label, onRemove }) {
  return (
    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-pizzabi-amber/15 border border-pizzabi-amber/30 text-pizzabi-amber whitespace-nowrap">
      {label}
      <button
        onClick={onRemove}
        className="hover:text-pizzabi-amber transition-colors ml-0.5"
        aria-label={`Remove filter: ${label}`}
      >
        <X size={10} strokeWidth={2.5} />
      </button>
    </span>
  )
}

export default function PizzaSalesHeader() {
  const [dateRange, setDateRange]         = useState(buildLast30Days())
  const [filterValues, setFilterValues]   = useState(INITIAL_FILTER_VALUES)
  const [activeFilters, setActiveFilters] = useState([]) // empty on load
  const [openFilter, setOpenFilter]       = useState(null)
  const [anchor, setAnchor]               = useState(null)

  const dateRangeChipRef = useRef(null)
  const chipRefs         = useRef({})

  function toggleDropdown(id, el) {
    if (openFilter === id) { setOpenFilter(null); return }
    const rect = el.getBoundingClientRect()
    setAnchor({ top: rect.bottom + 8, left: rect.left })
    setOpenFilter(id)
  }

  // ── Date Range ──────────────────────────────────────────────────────────────

  function handleDateRangeApply({ start, end, presetLabel }) {
    const displayLabel = presetLabel ??
      start.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
      " – " +
      end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

    setDateRange({ start, end, label: displayLabel })
    setOpenFilter(null)

    const tag = `Date Range: ${displayLabel}`
    setActiveFilters((prev) => {
      const exists = prev.some((f) => f.id === "dateRange")
      if (exists) return prev.map((f) => f.id === "dateRange" ? { ...f, label: tag } : f)
      return [...prev, { id: "dateRange", label: tag }]
    })
  }

  // ── Static filters ──────────────────────────────────────────────────────────

  function handleStaticSelect(id, value) {
    setFilterValues((prev) => ({ ...prev, [id]: value }))
    setOpenFilter(null)
    const config = FILTER_CONFIG.find((f) => f.id === id)
    if (value === "All") {
      setActiveFilters((prev) => prev.filter((f) => f.id !== id))
    } else {
      const tag = `${config.label}: ${value}`
      setActiveFilters((prev) => {
        const exists = prev.some((f) => f.id === id)
        if (exists) return prev.map((f) => f.id === id ? { ...f, label: tag } : f)
        return [...prev, { id, label: tag }]
      })
    }
  }

  // ── Active tag removal ──────────────────────────────────────────────────────

  function removeFilter(id) {
    if (id === "dateRange") {
      setDateRange(buildLast30Days())
    } else {
      setFilterValues((prev) => ({ ...prev, [id]: "All" }))
    }
    setActiveFilters((prev) => prev.filter((f) => f.id !== id))
  }

  // ── Clear all ───────────────────────────────────────────────────────────────

  function clearAll() {
    setDateRange(buildLast30Days())
    setFilterValues(INITIAL_FILTER_VALUES)
    setActiveFilters([]) // no tags shown after clear
    setOpenFilter(null)
  }

  const dateRangeOpen = openFilter === "dateRange"

  return (
    <header className="w-full bg-pizzabi-card border-b border-pizzabi-muted/20 px-4 md:px-6 py-4 space-y-3">

      {/* Title + Clear All */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-pizzabi-gold font-bold text-lg md:text-xl leading-tight">
            Pizza Sales Overview
          </h1>
          <p className="text-pizzabi-muted text-xs md:text-sm mt-0.5">
            Track key metrics and performance insights across all stores.
          </p>
        </div>

        {activeFilters.length > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-pizzabi-red/40 bg-pizzabi-red/10 text-pizzabi-red text-xs font-semibold hover:bg-pizzabi-red/20 transition-colors shrink-0"
          >
            <X size={11} strokeWidth={2.5} />
            Clear All Filters
          </button>
        )}
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">

        {/* Date Range */}
        <button
          ref={dateRangeChipRef}
          onClick={() => toggleDropdown("dateRange", dateRangeChipRef.current)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm whitespace-nowrap transition-colors shrink-0 ${
            dateRangeOpen
              ? "border-pizzabi-gold/50 bg-pizzabi-gold/10"
              : "border-pizzabi-muted/20 bg-pizzabi-card/80 hover:bg-pizzabi-card/90 hover:border-pizzabi-muted/40"
          }`}
        >
          <Calendar size={14} className="text-pizzabi-amber" />
          <span className="text-pizzabi-muted text-xs font-medium">Date Range</span>
          <span className="font-semibold text-xs text-pizzabi-foreground">{dateRange.label}</span>
          <ChevronDown
            size={12}
            className={`text-pizzabi-muted transition-transform duration-200 ${dateRangeOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Store / Region / Category / Size */}
        {FILTER_CONFIG.map((f) => {
          const Icon    = f.icon
          const val     = filterValues[f.id]
          const isOpen  = openFilter === f.id
          const isActive = val !== "All"
          return (
            <button
              key={f.id}
              ref={(el) => { chipRefs.current[f.id] = el }}
              onClick={() => toggleDropdown(f.id, chipRefs.current[f.id])}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm whitespace-nowrap transition-colors shrink-0 ${
                isOpen
                  ? "border-pizzabi-gold/50 bg-pizzabi-gold/10"
                  : "border-pizzabi-muted/20 bg-pizzabi-card/80 hover:bg-pizzabi-card/90 hover:border-pizzabi-muted/40"
              }`}
            >
              <Icon size={14} className={f.iconColor} />
              <span className="text-pizzabi-muted text-xs font-medium">{f.label}</span>
              <span className={`font-semibold text-xs ${isActive ? "text-pizzabi-foreground" : "text-pizzabi-muted"}`}>
                {val}
              </span>
              <ChevronDown
                size={12}
                className={`text-pizzabi-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
          )
        })}
      </div>

      {/* DateRangePicker */}
      {dateRangeOpen && anchor && (
        <DateRangePicker
          anchor={anchor}
          chipRef={dateRangeChipRef}
          initialStart={dateRange.start}
          initialEnd={dateRange.end}
          initialPreset={dateRange.label}
          onApply={handleDateRangeApply}
          onCancel={() => setOpenFilter(null)}
        />
      )}

      {/* Static filter dropdown */}
      {openFilter && openFilter !== "dateRange" && anchor && (
        <FilterDropdown
          options={FILTER_CONFIG.find((f) => f.id === openFilter)?.options ?? []}
          value={filterValues[openFilter]}
          onSelect={(val) => handleStaticSelect(openFilter, val)}
          onCancel={() => setOpenFilter(null)}
          anchor={anchor}
          chipRef={{ current: chipRefs.current[openFilter] }}
        />
      )}

      {/* Active filter tags — only shown when at least one is set */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-pizzabi-muted text-xs font-medium shrink-0">Active Filters:</span>
          {activeFilters.map((f) => (
            <ActiveTag key={f.id} label={f.label} onRemove={() => removeFilter(f.id)} />
          ))}
        </div>
      )}

    </header>
  )
}
