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

export default function KeyInsightsTable() {
  const insights = [
    {
      metric: "Top Menüpunkt",
      value: "Classic",
      performance:
        "Klassische Menüs sorgen für stärkeren Absatz – gezielte Aktionen können den Verkauf um 5-10 % steigern.",
      icon: "🍕",
    },
    {
      metric: "Umsatzfokus",
      value: "$201,88",
      performance:
        "Konstante Umsatzleistung zeigt Potenzial für zusätzliche Upsell-Angebote und Rabatte bei hoher Nachfrage.",
      icon: "💰",
    },
    {
      metric: "Regionale Strategie",
      value: "Kalifornien",
      performance:
        "Die stärkste Region sollte mit regionalen Kampagnen ausgebaut werden, um Umsatz und Marktanteil zu erhöhen.",
      icon: "📍",
    },
    {
      metric: "Bundle-Strategie",
      value: "Medium",
      performance:
        "Mittlere Bundles sind am beliebtesten; geeignete Kombi-Angebote können Bestellmengen nachhaltig erhöhen.",
      icon: "📦",
    },
    {
      metric: "Wachstumspotenzial",
      value: "9 Bestellungen",
      performance:
        "Aktuelle Bestellzahlen lassen ein Wachstum von 10-15 % erwarten, wenn Cross-Selling und Bundles stärker beworben werden.",
      icon: "⚡",
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
          Empfehlungen
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
                Kategorie
              </th>
              <th
                className="py-3 px-3 text-left font-semibold"
                style={{ color: C.muted }}
              >
                Empfehlung
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
            {insights.map((insight, idx) => (
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
                  <span className="mr-2">{insight.icon}</span>
                  {insight.metric}
                </td>
                <td
                  className="py-3 px-3 font-semibold"
                  style={{ color: C.orange }}
                >
                  {insight.value}
                </td>
                <td className="py-3 px-3" style={{ color: C.sub }}>
                  {insight.performance}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
