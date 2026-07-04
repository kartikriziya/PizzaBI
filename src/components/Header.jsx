import { useState } from "react"
import {
  Calendar,
  Home,
  Globe,
  Tag,
  Circle,
  Activity,
  ChevronDown,
  X,
} from "lucide-react"

const FILTERS = [
  {
    id: "dateRange",
    label: "Date Range",
    value: "Apr 1 – Apr 30, 2024",
    icon: Calendar,
    iconColor: "text-pizzabi-amber",
  },
  {
    id: "store",
    label: "Store",
    value: "City Center",
    icon: Home,
    iconColor: "text-pizzabi-muted",
  },
  {
    id: "region",
    label: "Region",
    value: "All",
    icon: Globe,
    iconColor: "text-pizzabi-muted",
  },
  {
    id: "category",
    label: "Category",
    value: "All",
    icon: Tag,
    iconColor: "text-pizzabi-muted",
  },
  {
    id: "size",
    label: "Size",
    value: "All",
    icon: Circle,
    iconColor: "text-pizzabi-muted",
  },
  {
    id: "launch",
    label: "Launch Period",
    value: "All",
    icon: Activity,
    iconColor: "text-pizzabi-muted",
  },
]

const INITIAL_ACTIVE_FILTERS = [
  { id: "dateRange", label: "Date Range: Apr 1 – Apr 30, 2024" },
  { id: "store", label: "Store: City Center" },
]

function FilterChip({ filter }) {
  const Icon = filter.icon
  const isActive = filter.value !== "All"

  return (
    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-pizzabi-muted/20 bg-pizzabi-card/80 text-sm whitespace-nowrap hover:bg-pizzabi-card/90 hover:border-pizzabi-muted/40 transition-colors">
      <Icon size={14} className={filter.iconColor} />
      <span className="text-pizzabi-muted text-xs font-medium">
        {filter.label}
      </span>
      <span
        className={`font-semibold text-xs ${isActive ? "text-white" : "text-pizzabi-muted"}`}
      >
        {filter.value}
      </span>
      <ChevronDown size={12} className="text-pizzabi-muted" />
    </button>
  )
}

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
  const [activeFilters, setActiveFilters] = useState(INITIAL_ACTIVE_FILTERS)

  const removeFilter = (id) =>
    setActiveFilters((prev) => prev.filter((f) => f.id !== id))

  const clearAll = () => setActiveFilters([])

  return (
    <header className="w-full bg-pizzabi-card border-b border-pizzabi-muted/20 px-4 md:px-6 py-4 space-y-3">
      {/* Dashboard header content with shared PizzaBI theme colors */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-pizzabi-gold font-bold text-lg md:text-xl leading-tight">
            Pizza Sales Filters
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

      {/* Filter chips — horizontally scrollable on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {FILTERS.map((f) => (
          <FilterChip key={f.id} filter={f} />
        ))}
      </div>

      {/* Active filter tags */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-pizzabi-muted text-xs font-medium shrink-0">
            Active Filters:
          </span>
          {activeFilters.map((f) => (
            <ActiveTag
              key={f.id}
              label={f.label}
              onRemove={() => removeFilter(f.id)}
            />
          ))}
        </div>
      )}
    </header>
  )
}
