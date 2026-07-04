import KeyInsights from "./KeyInsights"
import RecommendationsTable from "./RecommendationsTable"

// ── tokens ────────────────────────────────────────────────────────────────────
const C = {
  bg: "#0f1117",
  card: "#1a1d27",
  border: "#252840",
  orange: "#f5a623",
  muted: "#6b7280",
  text: "#e5e7eb",
}

/**
 * OverviewContent
 * ───────────────
 * Displays Key Insights as KPI cards and Recommendations as table.
 * With toggle between the two views.
 */
export default function OverviewContent() {
  return (
    <>
      {/* Header Section */}
      <div className="space-y-4 mb-6">
        <h1 className="text-2xl font-bold text-pizzabi-gold">
          Overview
        </h1>
        <p className="text-pizzabi-muted text-sm">
          Key insights and strategic recommendations for optimizing your pizza business performance.
        </p>
      </div>

      {/* Content Sections */}
      <section className="mb-6">
        <div
          className="w-full bg-pizzabi-card border border-pizzabi-muted/10 rounded-2xl p-4 md:p-6"
        >
          <KeyInsights />
        </div>
      </section>

      <section className="mb-6">
        <div
          className="w-full bg-pizzabi-card border border-pizzabi-muted/10 rounded-2xl p-4 md:p-6"
        >
          <RecommendationsTable />
        </div>
      </section>
    </>
  )
}
