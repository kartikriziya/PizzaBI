import React, { useEffect, useState } from "react"
import PizzaSalesHeader from "../components/Header"
import PizzaSalesCharts from "../components/PizzaSalesCharts"
import Charts from "../components/Charts"
import axios from "axios"

export default function Dashboard() {
  const [selectedFilters, setSelectedFilters] = useState({
    startDate: "",
    endDate: "",
    city: "",
    state: "",
    category: "",
    size: "",
  })

  return (
    <div className="min-h-screen bg-pizzabi-main">
      {/* Sticky header inside the dashboard content area */}
      <div className="sticky top-0 z-10">
        <PizzaSalesHeader onFiltersChange={setSelectedFilters} />
      </div>

      {/* Main content below the sticky header */}
      <main className="px-4 md:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-pizzabi-gold">
              Main Dashboard
            </h1>
            <p className="text-pizzabi-muted text-sm">
              Welcome back! Your core real-time analytics monitoring cards and
              sales data views will mount inside this frame.
            </p>
          </div>

          {/* Responsive chart container for future chart components */}
          <section className="bg-pizzabi-card border border-pizzabi-muted/10 rounded-3xl p-4 md:p-6">
            {/* <PizzaSalesCharts /> */}
            <Charts selectedFilters={selectedFilters} />
          </section>
        </div>
      </main>
    </div>
  )
}
