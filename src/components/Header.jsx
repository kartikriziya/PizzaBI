import { useEffect, useMemo, useState, useRef } from "react"
import {
  Calendar,
  Home,
  Globe,
  Tag,
  Circle,
  ChevronDown,
  X,
} from "lucide-react"
import { getFilters } from "../apis/filterApi.js"
// ----- Jahn 05.07 ------
import DateRangePicker, { formatRangeValue } from "./DateRangePicker"
// ----- Jahn 05.07 ------

function FilterChip({ filter, isOpen, onClick, options = [], onSelect }) {
  const Icon = filter.icon
  const isActive = filter.value !== "All"
  const dropdownRef = useRef(null)

  // Close dropdown if user clicks outside of it
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClick()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, onClick])

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={onClick}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm whitespace-nowrap transition-colors
          ${
            isOpen
              ? "bg-pizzabi-card border-pizzabi-amber text-white"
              : "bg-pizzabi-card bg-opacity-80 border-pizzabi-muted/20 hover:bg-opacity-90 hover:border-pizzabi-muted/40 text-pizzabi-muted"
          }`}
      >
        <Icon size={14} className={filter.iconColor} />
        <span className="text-xs font-medium">{filter.label}</span>
        <span
          className={`font-semibold text-xs ${isActive ? "text-white" : "text-pizzabi-muted"}`}
        >
          {filter.value}
        </span>
        <ChevronDown
          size={12}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* --- Dropdown Box Overlay --- */}
      {isOpen && (
        <div className="absolute left-0 mt-2 z-50 min-w-45 max-h-60 overflow-y-auto rounded-lg border border-pizzabi-muted/30 bg-pizzabi-card p-1 shadow-2xl">
          <button
            type="button"
            onClick={() => {
              onSelect("")
              onClick()
            }}
            className={`w-full text-left px-3 py-2 text-xs rounded-md transition-colors hover:bg-white/5 ${!isActive ? "text-pizzabi-amber font-semibold" : "text-pizzabi-muted"}`}
          >
            All
          </button>

          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onSelect(option)
                onClick()
              }}
              className={`w-full text-left px-3 py-2 text-xs rounded-md transition-colors hover:bg-white/5 ${filter.value === option ? "text-pizzabi-amber font-semibold bg-pizzabi-amber/10" : "text-white"}`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ActiveTag({ label, onRemove }) {
  return (
    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-pizzabi-amber/15 border border-pizzabi-amber/30 text-pizzabi-amber whitespace-nowrap">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="hover:text-pizzabi-amber transition-colors ml-0.5"
        aria-label={`Remove filter: ${label}`}
      >
        <X size={10} strokeWidth={2.5} />
      </button>
    </span>
  )
}

// ----- Jahn 05.07 ------
// Default date range = rolling "last 30 days", recomputed on page load/refresh.
function formatDateValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function parseDateValue(value) {
  if (!value) return null
  const [year, month, day] = value.split("-").map(Number)
  return new Date(year, month - 1, day)
}

function getDefaultDateRange() {
  const end = new Date()
  end.setHours(0, 0, 0, 0)
  const start = new Date(end)
  start.setDate(start.getDate() - 29)
  return {
    startDate: formatDateValue(start),
    endDate: formatDateValue(end),
  }
}
// ----- Jahn 05.07 ------

const DEFAULT_FILTERS = {
  // ----- Jahn 05.07 ------
  ...getDefaultDateRange(),
  // ----- Jahn 05.07 ------
  city: "",
  state: "",
  category: "",
  size: "",
}

export default function PizzaSalesHeader({
  onFiltersChange,
  selectedFilters: selectedFiltersProp = DEFAULT_FILTERS,
}) {
  const [filterOptions, setFilterOptions] = useState({
    cities: [],
    states: [],
    categories: [],
    sizes: [],
  })

  const [selectedFilters, setSelectedFilters] = useState(selectedFiltersProp)

  const [activeDropdown, setActiveDropdown] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // ----- Jahn 05.07 ------
  const dateRangeChipRef = useRef(null)
  const [dateRangeAnchor, setDateRangeAnchor] = useState(null)
  const dateRangeOpen = activeDropdown === "dateRange"
  // ----- Jahn 05.07 ------

  useEffect(() => {
    let active = true

    const fetchFilters = async () => {
      setLoading(true)
      setError("")

      try {
        const query = {
          city: selectedFilters.city || undefined,
          state: selectedFilters.state || undefined,
          category: selectedFilters.category || undefined,
          size: selectedFilters.size || undefined,
        }

        const data = await getFilters(query)
        if (!active) return

        setFilterOptions({
          cities: data.cities || [],
          states: data.states || [],
          categories: data.categories || [],
          sizes: data.sizes || [],
        })

        if (data.filters) {
          setSelectedFilters((prev) => ({
            ...prev,
            city: data.filters.city ?? prev.city,
            state: data.filters.state ?? prev.state,
            category: data.filters.category ?? prev.category,
            size: data.filters.size ?? prev.size,
          }))
        }
      } catch (err) {
        console.error(err)
        if (active) {
          setError("Unable to load filters.")
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    fetchFilters()
    return () => {
      active = false
    }
  }, [
    selectedFilters.city,
    selectedFilters.state,
    selectedFilters.category,
    selectedFilters.size,
  ])

  useEffect(() => {
    setSelectedFilters(selectedFiltersProp)
  }, [selectedFiltersProp])

  useEffect(() => {
    onFiltersChange?.(selectedFilters)
  }, [selectedFilters, onFiltersChange])

  const filtersConfig = useMemo(
    () => [
      {
        id: "city",
        label: "City",
        value: selectedFilters.city || "All",
        icon: Home,
        iconColor: "text-pizzabi-muted",
        options: filterOptions.cities,
      },
      {
        id: "state",
        label: "State",
        value: selectedFilters.state || "All",
        icon: Globe,
        iconColor: "text-pizzabi-muted",
        options: filterOptions.states,
      },
      {
        id: "category",
        label: "Category",
        value: selectedFilters.category || "All",
        icon: Tag,
        iconColor: "text-pizzabi-muted",
        options: filterOptions.categories,
      },
      {
        id: "size",
        label: "Size",
        value: selectedFilters.size || "All",
        icon: Circle,
        iconColor: "text-pizzabi-muted",
        options: filterOptions.sizes,
      },
    ],
    [selectedFilters, filterOptions],
  )

  // ----- Jahn 05.07 ------
  // "Last 30 days" is the built-in default, so it should never count as an
  // active/removable filter — only a range the user explicitly picked should.
  const defaultDateRange = getDefaultDateRange()
  const isDefaultDateRange =
    selectedFilters.startDate === defaultDateRange.startDate &&
    selectedFilters.endDate === defaultDateRange.endDate
  // ----- Jahn 05.07 ------

  const activeTags = useMemo(() => {
    const tags = []
    // ----- Jahn 05.07 ------
    if (
      selectedFilters.startDate &&
      selectedFilters.endDate &&
      !isDefaultDateRange
    ) {
      tags.push({
        id: "dateRange",
        label: `Date Range: ${formatRangeValue({
          start: parseDateValue(selectedFilters.startDate),
          end: parseDateValue(selectedFilters.endDate),
        })}`,
      })
    }
    // ----- Jahn 05.07 ------
    if (selectedFilters.city)
      tags.push({ id: "city", label: `City: ${selectedFilters.city}` })
    if (selectedFilters.state)
      tags.push({ id: "state", label: `State: ${selectedFilters.state}` })
    if (selectedFilters.category)
      tags.push({
        id: "category",
        label: `Category: ${selectedFilters.category}`,
      })
    if (selectedFilters.size)
      tags.push({ id: "size", label: `Size: ${selectedFilters.size}` })
    return tags
  }, [selectedFilters, isDefaultDateRange])

  const handleSelectFilter = (id, value) => {
    setSelectedFilters((prev) => ({ ...prev, [id]: value }))
  }

  // ----- Jahn 05.07 ------
  const toggleDateRangeDropdown = () => {
    if (dateRangeOpen) {
      setActiveDropdown(null)
      return
    }
    const rect = dateRangeChipRef.current.getBoundingClientRect()
    setDateRangeAnchor({ top: rect.bottom + 8, left: rect.left })
    setActiveDropdown("dateRange")
  }

  const toISODate = (date) => formatDateValue(date)

  const handleDateRangeApply = ({ start, end }) => {
    setSelectedFilters((prev) => ({
      ...prev,
      startDate: toISODate(start),
      endDate: toISODate(end),
    }))
    setActiveDropdown(null)
  }
  // ----- Jahn 05.07 ------

  const removeFilter = (id) => {
    // ----- Jahn 05.07 ------
    // Removing the date range goes back to the "last 30 days" default, not "All".
    if (id === "dateRange") {
      setSelectedFilters((prev) => ({ ...prev, ...getDefaultDateRange() }))
      return
    }
    // ----- Jahn 05.07 ------
    setSelectedFilters((prev) => ({ ...prev, [id]: "" }))
  }

  const clearAll = () => {
    setSelectedFilters(DEFAULT_FILTERS)
  }

  const toggleDropdown = (id) => {
    setActiveDropdown((prev) => (prev === id ? null : id))
  }

  return (
    <header className="w-full bg-pizzabi-card border-b border-pizzabi-muted/20 px-4 md:px-6 py-4 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-pizzabi-gold font-bold text-lg md:text-xl leading-tight">
            Pizza Sales Filters
          </h1>
          <p className="text-pizzabi-muted text-xs md:text-sm mt-0.5">
            Track key metrics and performance insights across all stores.
          </p>
          {error && <p className="text-pizzabi-red text-xs mt-1">{error}</p>}
        </div>

        {activeTags.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-pizzabi-red/40 bg-pizzabi-red/10 text-pizzabi-red text-xs font-semibold hover:bg-pizzabi-red/20 transition-colors shrink-0"
          >
            <X size={11} strokeWidth={2.5} />
            Clear All
          </button>
        )}
      </div>

      {/* Filter track — overflow-visible layout lets absolute elements display properly */}
      <div className="flex gap-2 overflow-visible pb-1 clean-scrollbar">
        {/* ----- Jahn 05.07 ------ */}
        <button
          type="button"
          ref={dateRangeChipRef}
          onClick={toggleDateRangeDropdown}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm whitespace-nowrap transition-colors
            ${
              dateRangeOpen
                ? "bg-pizzabi-card border-pizzabi-amber text-white"
                : "bg-pizzabi-card bg-opacity-80 border-pizzabi-muted/20 hover:bg-opacity-90 hover:border-pizzabi-muted/40 text-pizzabi-muted"
            }`}
        >
          <Calendar size={14} className="text-pizzabi-muted" />
          <span className="text-xs font-medium">Date Range</span>
          {/* ----- Jahn 05.07 ------ */}
          {/* Default range shows the "Letzte 30 Tage" label instead of the raw
              dates, since it's the baseline state, not a user-picked filter. */}
          <span
            className={`font-semibold text-xs ${
              !isDefaultDateRange &&
              selectedFilters.startDate &&
              selectedFilters.endDate
                ? "text-white"
                : "text-pizzabi-muted"
            }`}
          >
            {isDefaultDateRange
              ? "Letzte 30 Tage"
              : selectedFilters.startDate && selectedFilters.endDate
                ? formatRangeValue({
                    start: new Date(selectedFilters.startDate),
                    end: new Date(selectedFilters.endDate),
                  })
                : "All"}
          </span>
          {/* ----- Jahn 05.07 ------ */}
          <ChevronDown
            size={12}
            className={`transition-transform duration-200 ${dateRangeOpen ? "rotate-180" : ""}`}
          />
        </button>
        {/* ----- Jahn 05.07 ------ */}
        {filtersConfig.map((f) => (
          <FilterChip
            key={f.id}
            filter={f}
            options={f.options}
            isOpen={activeDropdown === f.id}
            onClick={() => toggleDropdown(f.id)}
            onSelect={(val) => handleSelectFilter(f.id, val)}
          />
        ))}
      </div>

      {/* ----- Jahn 05.07 ------ */}
      {dateRangeOpen && dateRangeAnchor && (
        <DateRangePicker
          anchor={dateRangeAnchor}
          chipRef={dateRangeChipRef}
          initialStart={
            selectedFilters.startDate
              ? parseDateValue(selectedFilters.startDate)
              : null
          }
          initialEnd={
            selectedFilters.endDate
              ? parseDateValue(selectedFilters.endDate)
              : null
          }
          onApply={handleDateRangeApply}
          onCancel={() => setActiveDropdown(null)}
        />
      )}
      {/* ----- Jahn 05.07 ------ */}

      {activeTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-pizzabi-muted text-xs font-medium shrink-0">
            Active Filters:
          </span>
          {activeTags.map((tag) => (
            <ActiveTag
              key={tag.id}
              label={tag.label}
              onRemove={() => removeFilter(tag.id)}
            />
          ))}
        </div>
      )}
    </header>
  )
}
