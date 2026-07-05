import React from "react"
import { useDependentFilters } from "../hooks/useDependentFilters"

export default function BackendDependentFilters() {
  const {
    filters,
    setFilter,
    resetFilters,
    filteredData,
    availableStates,
    availableCities,
    availableCategories,
    availableSizes,
    isLoading,
    error,
  } = useDependentFilters()

  const selectClassName =
    "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"

  return (
    <div className="mx-auto max-w-6xl space-y-6 rounded-2xl border border-slate-800 bg-slate-950 p-6 text-slate-100 shadow-xl">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Backend-driven dependent filters</h2>
        <p className="text-sm text-slate-400">
          Filter options are computed server-side from PostgreSQL and refreshed whenever a selection changes.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-2 text-sm">
          <span className="text-slate-300">State</span>
          <select
            className={selectClassName}
            value={filters.state ?? ""}
            onChange={(event) => setFilter("state", event.target.value || null)}
          >
            <option value="">All states</option>
            {availableStates.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm">
          <span className="text-slate-300">City</span>
          <select
            className={selectClassName}
            value={filters.city ?? ""}
            onChange={(event) => setFilter("city", event.target.value || null)}
          >
            <option value="">All cities</option>
            {availableCities.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm">
          <span className="text-slate-300">Category</span>
          <select
            className={selectClassName}
            value={filters.category ?? ""}
            onChange={(event) => setFilter("category", event.target.value || null)}
          >
            <option value="">All categories</option>
            {availableCategories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm">
          <span className="text-slate-300">Size</span>
          <select
            className={selectClassName}
            value={filters.size ?? ""}
            onChange={(event) => setFilter("size", event.target.value || null)}
          >
            <option value="">All sizes</option>
            {availableSizes.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={resetFilters}
          className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-amber-400 hover:text-amber-300"
        >
          Reset filters
        </button>
        <p className="text-sm text-slate-400">
          Visible records: <span className="font-semibold text-white">{filteredData.length}</span>
        </p>
        {isLoading && <span className="text-sm text-amber-400">Loading…</span>}
      </div>

      {error && <p className="rounded-lg border border-red-800 bg-red-950/60 p-3 text-sm text-red-300">{error}</p>}

      <div className="overflow-hidden rounded-xl border border-slate-800">
        <table className="min-w-full divide-y divide-slate-800 text-sm">
          <thead className="bg-slate-900 text-left text-slate-300">
            <tr>
              <th className="px-4 py-3">State</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Size</th>
              <th className="px-4 py-3">Sales</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950">
            {filteredData.map((record) => (
              <tr key={record.id} className="hover:bg-slate-900/70">
                <td className="px-4 py-3">{record.state}</td>
                <td className="px-4 py-3">{record.city}</td>
                <td className="px-4 py-3">{record.category}</td>
                <td className="px-4 py-3">{record.size}</td>
                <td className="px-4 py-3">{record.sales}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
