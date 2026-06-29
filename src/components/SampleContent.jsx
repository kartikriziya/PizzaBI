import { useState, useEffect, useRef } from "react"
import KeyInsightsTable from "./KeyInsightsTable"
import RecommendationsTable from "./RecommendationsTable"
import KeyInsights from "./KeyInsights"
import Recommendations from "./Recommendations"

// ── tokens ────────────────────────────────────────────────────────────────────
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

function Icon({ d, size = 16, color = "currentColor" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// KPI CARD
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Props
 * ─────
 * label       : string   – metric name
 * value       : string   – formatted value  e.g. "$1,248,250"
 * delta       : string   – change string    e.g. "+12.6%"
 * deltaLabel  : string   – context          e.g. "vs Apr 1 – Apr 30"
 * iconPath    : string   – SVG path d=""
 * accentColor : string   – hex colour for icon bg + border tint
 */
export function KpiCard({
  label = "Total Revenue",
  value = "$1,248,250",
  delta = "+12.6%",
  deltaLabel = "vs Apr 1 – Apr 30",
  iconPath = "M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  accentColor = C.orange,
}) {
  const positive = delta.startsWith("+")

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-1 cursor-default hover:scale-[1.02] transition-transform duration-200"
      style={{
        background: C.card,
        border: `1px solid ${accentColor}22`,
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        minWidth: 180,
      }}
    >
      {/* top row */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: C.muted }}>
          {label}
        </span>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: `${accentColor}22` }}
        >
          <Icon d={iconPath} size={14} color={accentColor} />
        </div>
      </div>

      {/* value */}
      <div
        className="text-2xl font-bold tracking-tight leading-tight mt-0.5"
        style={{ color: C.bright }}
      >
        {value}
      </div>

      {/* delta */}
      <div className="flex items-center gap-1 text-xs mt-0.5">
        <span
          className="font-semibold"
          style={{ color: positive ? C.green : C.red }}
        >
          {delta}
        </span>
        <span style={{ color: C.muted }}>{deltaLabel}</span>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// BAR CHART  (inline SVG, no external libs)
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_BAR_DATA = [
  { label: "Mon", value: 2892 },
  { label: "Tue", value: 2654 },
  { label: "Wed", value: 2781 },
  { label: "Thu", value: 2912 },
  { label: "Fri", value: 3154 },
  { label: "Sat", value: 2367 },
  { label: "Sun", value: 1972 },
]

function BarChartSvg({
  data,
  color = C.orange,
  height = 180,
  labelFontSize = 10,
}) {
  const max = Math.max(...data.map((d) => d.value))
  const barW = 32
  const gap = 12
  const padL = 40
  const padB = 24
  const padT = 16
  const chartH = height - padB - padT
  const totalW = padL + data.length * (barW + gap) - gap + 8

  // y-axis ticks
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(t * max))

  return (
    <svg
      viewBox={`0 0 ${totalW} ${height}`}
      width="100%"
      height={height}
      style={{ overflow: "hidden" }}
    >
      {/* grid lines */}
      {ticks.map((t) => {
        const y = padT + chartH - (t / max) * chartH
        return (
          <g key={t}>
            <line
              x1={padL}
              x2={totalW}
              y1={y}
              y2={y}
              stroke={C.border}
              strokeWidth={1}
              strokeDasharray="4,4"
            />
            <text
              x={padL - 6}
              y={y + 3}
              textAnchor="end"
              fontSize={labelFontSize - 1}
              fill={C.muted}
            >
              {t >= 1000 ? `${(t / 1000).toFixed(1)}k` : t}
            </text>
          </g>
        )
      })}

      {/* bars */}
      {data.map((d, i) => {
        const bh = (d.value / max) * chartH
        const x = padL + i * (barW + gap)
        const y = padT + chartH - bh
        return (
          <g key={i}>
            {/* bar shadow */}
            <rect
              x={x + 2}
              y={y + 2}
              width={barW}
              height={bh}
              rx={5}
              fill={color}
              opacity={0.15}
            />
            {/* bar */}
            <rect
              x={x}
              y={y}
              width={barW}
              height={bh}
              rx={5}
              fill={color}
              opacity={0.9}
            />
            {/* value label on top */}
            <text
              x={x + barW / 2}
              y={y - 5}
              textAnchor="middle"
              fontSize={labelFontSize - 1}
              fill={C.sub}
              fontWeight="500"
            >
              {d.value >= 1000 ? `${(d.value / 1000).toFixed(1)}k` : d.value}
            </text>
            {/* x label */}
            <text
              x={x + barW / 2}
              y={height - 4}
              textAnchor="middle"
              fontSize={labelFontSize}
              fill={C.muted}
            >
              {d.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// fullscreen overlay
function FullscreenOverlay({ data, color, title, onClose }) {
  // close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(10,11,18,0.92)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl w-full max-w-4xl p-6 flex flex-col gap-4"
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          maxHeight: "90vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between">
          <span className="font-semibold text-base" style={{ color: C.text }}>
            {title}
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
            style={{ background: "#252840" }}
          >
            <Icon d="M18 6L6 18M6 6l12 12" size={14} color={C.sub} />
          </button>
        </div>
        {/* large chart */}
        <div className="flex-1 overflow-hidden">
          <BarChartSvg
            data={data}
            color={color}
            height={420}
            labelFontSize={12}
          />
        </div>
        <p className="text-xs text-center" style={{ color: C.muted }}>
          Press{" "}
          <kbd
            className="px-1.5 py-0.5 rounded text-[10px]"
            style={{ background: "#252840", color: C.sub }}
          >
            Esc
          </kbd>{" "}
          or click outside to close
        </p>
      </div>
    </div>
  )
}

// ── BarChartCard ──────────────────────────────────────────────────────────────
/**
 * Props
 * ─────
 * title   : string
 * data    : { label: string, value: number }[]
 * color   : hex string for bar fill
 */
export function BarChartCard({
  title = "Orders by Weekday",
  data = DEFAULT_BAR_DATA,
  color = C.orange,
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <div
        className="rounded-2xl p-4 flex flex-col gap-2"
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        }}
      >
        {/* card header */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold" style={{ color: C.text }}>
            {title}
          </span>
          <button
            onClick={() => setExpanded(true)}
            title="Expand to fullscreen"
            className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg hover:opacity-80 transition-opacity"
            style={{ background: "#252840", color: C.sub }}
          >
            <Icon
              d="M8 3H5a2 2 0 00-2 2v3M21 8V5a2 2 0 00-2-2h-3M3 16v3a2 2 0 002 2h3M16 21h3a2 2 0 002-2v-3"
              size={12}
              color={C.sub}
            />
            Expand
          </button>
        </div>

        {/* inline chart */}
        <BarChartSvg data={data} color={color} height={180} />
      </div>

      {/* fullscreen portal */}
      {expanded && (
        <FullscreenOverlay
          data={data}
          color={color}
          title={title}
          onClose={() => setExpanded(false)}
        />
      )}
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTENT  – composes KpiCard + BarChartCard inside a scrollable area
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Props
 * ─────
 * kpi      : KpiCard props object  (optional, uses defaults)
 * chart    : BarChartCard props object  (optional, uses defaults)
 *
 * You can replace the kpi / chart props to inject your own data,
 * or swap out the child components entirely.
 */
export default function SampleContent({ kpi = {}, chart = {} }) {
  const [viewMode, setViewMode] = useState("both") // "both", "table", "cards"

  return (
    <div
      className="flex-1 overflow-y-auto p-5"
      style={{
        background: C.bg,
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      {/* ── View Mode Toggle ── */}
      <section className="mb-6 flex gap-2">
        <button
          onClick={() => setViewMode("both")}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            background: viewMode === "both" ? C.orange : C.card,
            color: viewMode === "both" ? "#000" : C.text,
            border: `1px solid ${C.border}`,
          }}
        >
          Both Views
        </button>
        <button
          onClick={() => setViewMode("table")}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            background: viewMode === "table" ? C.orange : C.card,
            color: viewMode === "table" ? "#000" : C.text,
            border: `1px solid ${C.border}`,
          }}
        >
          Table
        </button>
        <button
          onClick={() => setViewMode("cards")}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            background: viewMode === "cards" ? C.orange : C.card,
            color: viewMode === "cards" ? "#000" : C.text,
            border: `1px solid ${C.border}`,
          }}
        >
          Cards
        </button>
      </section>

      {/* ── Table Version ── */}
      {(viewMode === "both" || viewMode === "table") && (
        <>
          <section className="mb-6">
            <h2
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: C.muted }}
            >
            Table View
            </h2>
            <KeyInsightsTable />
          </section>

          <section className="mb-6">
            <RecommendationsTable />
          </section>
        </>
      )}

      {/* ── Card Version ── */}
      {(viewMode === "both" || viewMode === "cards") && (
        <>
          <section className="mb-6">
            <h2
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: C.muted }}
            >
            Card View
            </h2>
            <div style={{ background: C.bg }}>
              <KeyInsights />
            </div>
          </section>

          <section className="mb-6">
            <div style={{ background: C.bg }}>
              <Recommendations />
            </div>
          </section>
        </>
      )}

      {/* ── KPI row ── */}
      <section className="mb-4">
        <h2
          className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: C.muted }}
        >
          Key Metrics
        </h2>
        {/* add more <KpiCard /> here to build a full KPI row */}
        <div className="flex flex-wrap gap-3">
          <KpiCard {...kpi} />
        </div>
      </section>

      {/* ── Chart row ── */}
      <section>
        <h2
          className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: C.muted }}
        >
          Charts
        </h2>
        {/* add more <BarChartCard /> here for a multi-chart grid */}
        <div className="grid grid-cols-1 gap-4" style={{ maxWidth: 520 }}>
          <BarChartCard {...chart} />
        </div>
      </section>
    </div>
  )
}
