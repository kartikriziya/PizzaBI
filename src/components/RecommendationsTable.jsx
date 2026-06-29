import React from "react"

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

export default function RecommendationsTable() {
  const recommendations = [
    {
      category: "Top Menu Item",
      recommendation: "Margherita Pizza",
      rationale: "Feature as best seller - highly profitable and customer favorite",
      icon: "🍽️",
    },
    {
      category: "Premium Recommendation",
      recommendation: "Pepperoni Pizza",
      rationale: "Highest revenue generator - optimize pricing and promote",
      icon: "🏆",
    },
    {
      category: "Regional Strategy",
      recommendation: "BBQ Chicken Focus",
      rationale: "Dominant in key markets - expand availability in Downtown & City Center",
      icon: "👑",
    },
    {
      category: "Bundle Strategy",
      recommendation: "Large Size Combos",
      rationale: "Largest profit contributor - create combo deals for large pizzas",
      icon: "🎯",
    },
    {
      category: "New Launch Push",
      recommendation: "BBQ Chicken Special",
      rationale: "New launch performing well - increase promotional activities",
      icon: "💡",
    },
  ]

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      {/* header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold" style={{ color: C.text }}>
          Recommendations
        </span>
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
