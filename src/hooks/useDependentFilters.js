import { useCallback, useEffect, useMemo, useState } from "react"
import { getFilters } from "../apis/filterApi"

const EMPTY_FILTERS = {
  state: null,
  city: null,
  category: null,
  size: null,
}

export function useDependentFilters() {
  const [filters, setFiltersState] = useState(EMPTY_FILTERS)
  const [data, setData] = useState({
    filteredData: [],
    availableStates: [],
    availableCities: [],
    availableCategories: [],
    availableSizes: [],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const queryParams = useMemo(() => {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      }
    })

    return params.toString()
  }, [filters])

  useEffect(() => {
    let isActive = true

    const loadFilters = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await getFilters(filters)
        if (!isActive) return

        setData({
          filteredData: result.filteredData ?? [],
          availableStates: result.availableStates ?? [],
          availableCities: result.availableCities ?? [],
          availableCategories: result.availableCategories ?? [],
          availableSizes: result.availableSizes ?? [],
        })

        if (result.filters) {
          setFiltersState((previous) => ({ ...previous, ...result.filters }))
        }
      } catch (err) {
        if (!isActive) return
        setError(err.message || "Failed to load filters")
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    loadFilters()

    return () => {
      isActive = false
    }
  }, [queryParams])

  const setFilter = useCallback((key, value) => {
    setFiltersState((previous) => ({
      ...previous,
      [key]: value || null,
    }))
  }, [])

  const resetFilters = useCallback(() => {
    setFiltersState(EMPTY_FILTERS)
  }, [])

  return {
    filters,
    setFilter,
    resetFilters,
    filteredData: data.filteredData,
    availableStates: data.availableStates,
    availableCities: data.availableCities,
    availableCategories: data.availableCategories,
    availableSizes: data.availableSizes,
    isLoading,
    error,
  }
}
