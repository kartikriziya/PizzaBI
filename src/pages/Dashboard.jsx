import React from "react"
import PizzaSalesHeader from "../components/Header"
import Charts from "../components/Charts"
import ChartCoMatrix from "../components/ChartCoMatrix"

export default function Dashboard({ selectedFilters, onFiltersChange }) {
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
          <div className="space-y-4 mb-6">
            <h1 className="text-2xl font-bold text-pizzabi-gold">
              Main Dashboard
            </h1>
            <p className="text-pizzabi-muted text-sm">
              Welcome back! Your core real-time analytics monitoring cards and
              sales data views will mount inside this frame.
            </p>
          </div>
          {/* <PizzaSalesCharts /> */}
          <Charts selectedFilters={selectedFilters} />
        </section>
      </main>
    </div>
  )
}
