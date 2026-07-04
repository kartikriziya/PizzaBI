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

const DEFAULT_FILTERS = {
  startDate: "",
  endDate: "",
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

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const data = await getFilters()
        setFilterOptions({
          cities: data.cities || [],
          states: data.states || [],
          categories: data.categories || [],
          sizes: data.sizes || [],
        })
      } catch (err) {
        console.error(err)
        setError("Unable to load filters.")
      } finally {
        setLoading(false)
      }
    }
    fetchFilters()
  }, [])

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

  const activeTags = useMemo(() => {
    const tags = []
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
  }, [selectedFilters])

  const handleSelectFilter = (id, value) => {
    setSelectedFilters((prev) => ({ ...prev, [id]: value }))
  }

  const removeFilter = (id) => {
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
