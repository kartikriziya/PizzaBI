import React, { useMemo } from "react"

const C = {
  bg: "#0f1117",
  card: "#1a1d27",
  border: "#252840",
  orange: "#f5a623",
  red: "#e84040",
  green: "#4caf50",
  muted: "#6b7280",
  sub: "#9ca3af",
  text: "#e5e7eb",
  bright: "#f9fafb",
}

export default function RecommendationsTable({ overviewData, loading, error }) {
  const recommendations = useMemo(() => {
    if (!overviewData) {
      return []
    }

    const {
      kpiMetrics = {},
      categoryData = [],
      sizeData = [],
      radarData = [],
    } = overviewData
    const topCategory = [...categoryData].sort((a, b) => b.orders - a.orders)[0]
    const topSize = [...sizeData].sort((a, b) => b.value - a.value)[0]
    const topRegion = [...radarData].sort((a, b) => b.orders - a.orders)[0]

    return [
      {
        category: "Top Menu Item",
        recommendation: topCategory?.name || "No data",
        rationale: topCategory
          ? `Prioritize ${topCategory.name} because it is leading the current selection with ${topCategory.orders} orders.`
          : "There is not enough category performance data to recommend a top menu item.",
        icon: "🍽️",
      },
      {
        category: "Revenue Focus",
        recommendation: `$${Number(kpiMetrics.totalRevenue?.value || 0).toLocaleString()}`,
        rationale: kpiMetrics.totalRevenue?.delta
          ? `Revenue is tracking ${kpiMetrics.totalRevenue.delta}.`
          : "Revenue trend is currently unavailable.",
        icon: "💰",
      },
      {
        category: "Regional Strategy",
        recommendation: topRegion?.region || "No data",
        rationale: topRegion
          ? `Double down on ${topRegion.region} as the strongest region in the active filter set.`
          : "No regional performance data is available.",
        icon: "👑",
      },
      {
        category: "Bundle Strategy",
        recommendation: topSize?.name || "No data",
        rationale: topSize
          ? `Create bundle offers around ${topSize.name} to capture the most common size preference.`
          : "No size distribution data is available.",
        icon: "🎯",
      },
      {
        category: "Growth Opportunity",
        recommendation: `${kpiMetrics.totalOrders?.value || 0} orders`,
        rationale: kpiMetrics.totalOrders?.delta
          ? `Order volume is changing by ${kpiMetrics.totalOrders.delta}.`
          : "Order volume movement is currently unavailable.",
        icon: "💡",
      },
    ]
  }, [overviewData])

  if (loading && !overviewData) {
    return (
      <div className="rounded-lg border border-white/10 p-4 text-sm text-pizzabi-muted">
        Loading recommendations...
      </div>
    )
  }

  if (error && !overviewData) {
    return <p className="text-sm text-pizzabi-red">{error}</p>
  }

  return (
    <div
      className="flex flex-col gap-3 rounded-lg p-3 transition-all duration-200"
      style={{
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        border: `1px solid ${C.border}`,
        background: "transparent",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = C.orange
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = C.border
      }}
    >
      {/* header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold mb-1" style={{ color: C.orange }}>
          Recommendations
        </h3>
        <p className="text-sm" style={{ color: C.muted }}>
          Strategic actions and optimization opportunities for growth
        </p>
      </div>

      {/* table */}
      <div className="overflow-x-auto">
        <table
          className="w-full text-sm"
          style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
        >
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              <th
                className="py-3 px-3 text-left font-semibold"
                style={{ color: C.muted }}
              >
                Category
              </th>
              <th
                className="py-3 px-3 text-left font-semibold"
                style={{ color: C.muted }}
              >
                Recommendation
              </th>
              <th
                className="py-3 px-3 text-left font-semibold"
                style={{ color: C.muted }}
              >
                Rationale
              </th>
            </tr>
          </thead>
          <tbody>
            {recommendations.map((rec, idx) => (
              <tr
                key={idx}
                style={{
                  borderBottom: `1px solid ${C.border}`,
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#252840"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent"
                }}
              >
                <td className="py-3 px-3" style={{ color: C.text }}>
                  <span className="mr-2">{rec.icon}</span>
                  {rec.category}
                </td>
                <td
                  className="py-3 px-3 font-semibold"
                  style={{ color: C.orange }}
                >
                  {rec.recommendation}
                </td>
                <td className="py-3 px-3" style={{ color: C.sub }}>
                  {rec.rationale}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
