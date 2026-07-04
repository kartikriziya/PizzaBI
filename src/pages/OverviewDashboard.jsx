import React from "react"
import PizzaSalesHeader from "../components/Header"
import OverviewContent from "../components/OverviewContent"

export default function OverviewDashboard({
  selectedFilters,
  onFiltersChange,
}) {
  return (
    <div className="min-h-screen bg-pizzabi-main">
      {/* Sticky header inside the dashboard content area */}
      <div className="sticky top-0 z-10">
        <PizzaSalesHeader
          selectedFilters={selectedFilters}
          onFiltersChange={onFiltersChange}
        />
      </div>

      {/* Main content below the sticky header */}
      <main className="w-full">
        {/* Responsive chart container for future chart components */}
        <section className="w-full bg-pizzabi-card border border-pizzabi-muted/10 p-4 md:p-6">
          <OverviewContent selectedFilters={selectedFilters} />
        </section>
      </main>
    </div>
  )
}
