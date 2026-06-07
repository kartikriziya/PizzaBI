import { useState } from "react"
import Sidebar from "../components/SampleSidebar"
import Header from "../components/SampleHeader"
import Content from "../components/SampleContent"

/**
 * Dashboard
 * ─────────
 * Root shell that composes Sidebar + Header + Content.
 * All state lives here and is passed down as props so every
 * child component stays stateless / easily testable.
 *
 * Props
 * ─────
 * None required — works out of the box with demo data.
 * Pass `kpi` and `chart` objects to inject real data into Content.
 */
export default function Dashboard({ kpi = {}, chart = {} }) {
  // ── sidebar state ──────────────────────────────────────────────────────────
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeNav, setActiveNav] = useState("overview")

  // ── filter state ───────────────────────────────────────────────────────────
  const [filters, setFilters] = useState({
    dateRange: "May 1 – May 31, 2024",
    store: "Stockton",
    region: "All",
    category: "All",
    size: "All",
    launch: "All",
  })

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        background: "#0f1117",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      {/* ── SIDEBAR ─────────────────────────────────────────────────────────── */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
        activeNav={activeNav}
        onNavChange={setActiveNav}
      />

      {/* ── RIGHT COLUMN ────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* ── HEADER ────────────────────────────────────────────────────────── */}
        <Header
          title="Pizza Sales Overview"
          subtitle="Track key metrics and performance insights across all stores."
          filters={filters}
          onFiltersChange={setFilters}
        />

        {/* ── CONTENT ───────────────────────────────────────────────────────── */}
        <Content kpi={kpi} chart={chart} />
      </div>
    </div>
  )
}
