import { useState } from "react"

// ─── tiny icon stubs (inline SVG) ────────────────────────────────────────────
const Icon = ({ d, size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d={d} />
  </svg>
)
const icons = {
  overview: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
  sales:
    "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  orders:
    "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  menu: "M4 6h16M4 12h16M4 18h16",
  stores: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
  customers:
    "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  marketing: "M22 12h-4l-3 9L9 3l-3 9H2",
  reports: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z",
  alerts: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
  settings:
    "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
}

// ─── colour palette derived from PizzaBI cover ───────────────────────────────
// bg: #0f1117  card: #1a1d27  accent-orange: #f5a623  accent-red: #e84040  accent-green: #4caf50

// ─── data stubs ──────────────────────────────────────────────────────────────
const KPI_CARDS = [
  {
    label: "Total Revenue",
    value: "$1,248,250",
    delta: "+12.6%",
    icon: "M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
    color: "#f5a623",
  },
  {
    label: "Total Orders",
    value: "18,732",
    delta: "+8.3%",
    icon: icons.orders,
    color: "#4caf50",
  },
  {
    label: "Pizzas Sold",
    value: "28,451",
    delta: "+10.7%",
    icon: "M12 2a10 10 0 100 20A10 10 0 0012 2zM2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20",
    color: "#e84040",
  },
  {
    label: "Avg. Order Value",
    value: "$66.61",
    delta: "+4.0%",
    icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8z",
    color: "#f5a623",
  },
  {
    label: "New Customers",
    value: "2,745",
    delta: "+6.9%",
    icon: icons.customers,
    color: "#4caf50",
  },
]

const TOP_PIZZAS = [
  { name: "Margherita", sold: 2436 },
  { name: "Pepperoni", sold: 2128 },
  { name: "BBQ Chicken", sold: 1987 },
  { name: "Veggie Supreme", sold: 1845 },
  { name: "Hawaiian", sold: 1654 },
  { name: "Meat Lovers", sold: 1412 },
  { name: "Creamy Alfredo", sold: 1230 },
  { name: "Spicy Italian", sold: 1110 },
  { name: "Four Cheese", sold: 965 },
  { name: "Tandoori Paneer", sold: 769 },
]

const TOP_PIZZAS_REVENUE = [
  { name: "Pepperoni", rev: 142000 },
  { name: "Margherita", rev: 128000 },
  { name: "BBQ Chicken", rev: 128000 },
  { name: "Creamy Alfredo", rev: 115000 },
  { name: "Meat Lovers", rev: 98000 },
  { name: "Veggie Supreme", rev: 89000 },
  { name: "Hawaiian", rev: 78000 },
  { name: "Spicy Italian", rev: 71000 },
  { name: "Four Cheese", rev: 63000 },
  { name: "Tandoori Paneer", rev: 48000 },
]

const MONTHLY_REVENUE = [
  { label: "May 1", val: 280000 },
  { label: "May 8", val: 420000 },
  { label: "May 15", val: 390000 },
  { label: "May 22", val: 580000 },
  { label: "May 29", val: 510000 },
]

const ORDERS_BY_DAY = [
  { label: "Mon", val: 2892 },
  { label: "Tue", val: 2654 },
  { label: "Wed", val: 2781 },
  { label: "Thu", val: 2912 },
  { label: "Fri", val: 3154 },
  { label: "Sat", val: 2367 },
  { label: "Sun", val: 1972 },
]

const SIZE_DATA = [
  { label: "Small", pct: 14.1, color: "#f5a623" },
  { label: "Medium", pct: 17.8, color: "#e84040" },
  { label: "Large", pct: 31.4, color: "#4caf50" },
  { label: "Extra Large", pct: 36.7, color: "#9b59b6" },
]
const CAT_DATA = [
  { label: "Classic", pct: 41.4, color: "#f5a623" },
  { label: "Vegetarian", pct: 28.7, color: "#4caf50" },
  { label: "Specialty", pct: 29.9, color: "#e84040" },
]
const TOP_STORES = [
  { rank: 1, name: "Downtown Store", rev: "$186,540", delta: "+14.2%" },
  { rank: 2, name: "City Center Store", rev: "$162,380", delta: "+11.3%" },
  { rank: 3, name: "Westside Store", rev: "$146,770", delta: "+9.8%" },
  { rank: 4, name: "North Point Store", rev: "$123,450", delta: "+8.7%" },
  { rank: 5, name: "East End Store", rev: "$98,230", delta: "+6.1%" },
]

const STORE_MATRIX = [
  {
    store: "Downtown Store",
    vals: [32.1, 45.6, 38.7, 29.4, 41.2, 27.6, 31.0, 26.5, 19.6],
  },
  {
    store: "City Center Store",
    vals: [28.7, 40.1, 31.6, 27.8, 35.9, 24.3, 29.7, 24.1, 17.8],
  },
  {
    store: "Westside Store",
    vals: [25.3, 36.2, 29.9, 25.1, 32.4, 21.6, 26.8, 22.3, 16.0],
  },
  {
    store: "North Point Store",
    vals: [20.4, 28.7, 22.6, 19.8, 26.5, 17.3, 22.1, 18.5, 13.2],
  },
  {
    store: "East End Store",
    vals: [16.2, 22.9, 18.3, 15.7, 20.4, 13.9, 17.6, 14.6, 10.5],
  },
]
const PIZZA_COLS = [
  "Margherita",
  "Pepperoni",
  "BBQ Chicken",
  "Veggie Supreme",
  "Meat Lovers",
  "Four Cheese",
  "Spicy Italian",
  "Creamy Alfredo",
  "Tandoori Paneer",
]

const INSIGHTS = [
  {
    icon: "🍕",
    title: "Best Seller of the Month",
    body: "Margherita was the top-selling pizza with 2,436 pizzas sold.",
  },
  {
    icon: "💰",
    title: "Strongest Pizza",
    body: "Pepperoni generated the highest revenue at $142K.",
  },
  {
    icon: "📍",
    title: "Regional Favorite",
    body: "BBQ Chicken performs best at Downtown and City Center stores.",
  },
  {
    icon: "📏",
    title: "Size Strategy",
    body: "Large size pizzas contribute the most to sales (36.7%).",
  },
]

// ─── helpers ─────────────────────────────────────────────────────────────────
function heatColor(val) {
  // 10 → cool blue-ish, 46 → hot red-orange
  const t = (val - 10) / 36
  const r = Math.round(40 + t * (248 - 40))
  const g = Math.round(130 + t * (80 - 130))
  const b = Math.round(220 + t * (40 - 220))
  return `rgb(${r},${g},${b})`
}

// ─── mini chart components (pure CSS / inline SVG — no extra libs) ────────────

function BarChart({
  data,
  colorKey = "#f5a623",
  horizontal = false,
  height = 140,
}) {
  const max = Math.max(...data.map((d) => d.val))
  if (horizontal) {
    return (
      <div className="space-y-[6px] mt-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span
              className="w-28 text-right truncate"
              style={{ color: "#9ca3af", fontSize: 10 }}
            >
              {d.name}
            </span>
            <div
              className="flex-1 h-[14px] rounded-sm overflow-hidden"
              style={{ background: "#1e2235" }}
            >
              <div
                className="h-full rounded-sm transition-all duration-700"
                style={{
                  width: `${(d.sold / 2436) * 100}%`,
                  background: colorKey,
                }}
              />
            </div>
            <span
              style={{
                color: "#e5e7eb",
                fontSize: 10,
                minWidth: 32,
                textAlign: "right",
              }}
            >
              {d.sold.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return (
    <svg
      viewBox={`0 0 ${data.length * 28} ${height}`}
      className="w-full"
      style={{ height }}
    >
      {data.map((d, i) => {
        const bh = (d.val / max) * (height - 24)
        return (
          <g key={i}>
            <rect
              x={i * 28 + 4}
              y={height - 20 - bh}
              width={20}
              height={bh}
              fill={colorKey}
              rx={3}
              opacity={0.9}
            />
            <text
              x={i * 28 + 14}
              y={height - 4}
              textAnchor="middle"
              fontSize={8}
              fill="#9ca3af"
            >
              {d.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function LineChart({ data, color = "#f5a623", height = 100 }) {
  const vals = data.map((d) => d.val)
  const max = Math.max(...vals),
    min = Math.min(...vals)
  const W = 280,
    H = height - 16
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * W
    const y = H - ((d.val - min) / (max - min)) * H + 8
    return [x, y]
  })
  const path = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`)
    .join(" ")
  const area = path + ` L${pts[pts.length - 1][0]},${height} L0,${height} Z`
  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient
          id={`lg-${color.replace("#", "")}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#lg-${color.replace("#", "")})`} />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      {pts.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={3.5}
          fill={color}
          stroke="#1a1d27"
          strokeWidth={1.5}
        />
      ))}
    </svg>
  )
}

function DonutChart({ segments, size = 100 }) {
  const R = 36,
    cx = size / 2,
    cy = size / 2
  const total = segments.reduce((s, d) => s + d.pct, 0)
  let cumulative = 0
  const slices = segments.map((seg) => {
    const startAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2
    cumulative += seg.pct
    const endAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2
    const x1 = cx + R * Math.cos(startAngle)
    const y1 = cy + R * Math.sin(startAngle)
    const x2 = cx + R * Math.cos(endAngle)
    const y2 = cy + R * Math.sin(endAngle)
    const large = endAngle - startAngle > Math.PI ? 1 : 0
    return {
      ...seg,
      d: `M${cx},${cy} L${x1},${y1} A${R},${R} 0 ${large} 1 ${x2},${y2} Z`,
    }
  })
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      <circle cx={cx} cy={cy} r={22} fill="#1a1d27" />
      {slices.map((s, i) => (
        <path key={i} d={s.d} fill={s.color} opacity={0.92} />
      ))}
      <circle cx={cx} cy={cy} r={22} fill="#1a1d27" />
    </svg>
  )
}

// ─── shared card shell ────────────────────────────────────────────────────────
function Card({ title, children, className = "" }) {
  return (
    <div
      className={`rounded-2xl p-4 flex flex-col gap-2 ${className}`}
      style={{ background: "#1a1d27", border: "1px solid #252840" }}
    >
      {title && (
        <div className="flex items-center justify-between mb-1">
          <span
            className="text-sm font-semibold tracking-wide"
            style={{ color: "#e5e7eb" }}
          >
            {title}
          </span>
          <button className="opacity-40 hover:opacity-80 transition-opacity">
            <Icon
              d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"
              size={14}
              className="text-gray-400"
            />
          </button>
        </div>
      )}
      {children}
    </div>
  )
}

// ─── NAV ─────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { key: "overview", label: "Overview" },
  { key: "sales", label: "Sales" },
  { key: "orders", label: "Orders" },
  { key: "menu", label: "Menu" },
  { key: "stores", label: "Stores" },
  { key: "customers", label: "Customers" },
  { key: "marketing", label: "Marketing" },
  { key: "reports", label: "Reports" },
  { key: "alerts", label: "Alerts" },
  { key: "settings", label: "Settings" },
]

// ─── FILTER BAR ───────────────────────────────────────────────────────────────
const FILTER_DEFAULTS = {
  dateRange: "May 1 – May 31, 2024",
  store: "Stockton",
  region: "All",
  category: "All",
  size: "All",
  launch: "All",
}

function FilterPill({ label, onRemove }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-3 py-[3px] rounded-full text-xs font-medium"
      style={{
        background: "#252840",
        color: "#f5a623",
        border: "1px solid #f5a62344",
      }}
    >
      {label}
      <button onClick={onRemove} className="ml-1 opacity-60 hover:opacity-100">
        ×
      </button>
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function PizzaBIDashboard() {
  const [activeNav, setActiveNav] = useState("overview")
  const [filters, setFilters] = useState({ ...FILTER_DEFAULTS })
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const removeFilter = (key) => setFilters((f) => ({ ...f, [key]: "All" }))
  const activePills = Object.entries(filters).filter(([, v]) => v !== "All")

  return (
    <div
      className="flex h-screen overflow-hidden select-none"
      style={{
        background: "#0f1117",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        color: "#e5e7eb",
      }}
    >
      {/* ── SIDEBAR ─────────────────────────────────────────────────────────── */}
      <aside
        className={`flex-shrink-0 flex flex-col transition-all duration-300 ${sidebarOpen ? "w-52" : "w-16"}`}
        style={{ background: "#13151f", borderRight: "1px solid #252840" }}
      >
        {/* logo */}
        <div
          className="flex items-center gap-2 px-4 py-5"
          style={{ borderBottom: "1px solid #252840" }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#f5a623,#e84040)" }}
          >
            🍕
          </div>
          {sidebarOpen && (
            <div>
              <div className="font-bold text-sm leading-none">
                <span style={{ color: "#fff" }}>Pizza</span>
                <span style={{ color: "#f5a623" }}>BI</span>
              </div>
              <div className="text-[10px] mt-0.5" style={{ color: "#6b7280" }}>
                Analytics Dashboard
              </div>
            </div>
          )}
        </div>

        {/* nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((n) => (
            <button
              key={n.key}
              onClick={() => setActiveNav(n.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150
                ${activeNav === n.key ? "font-semibold" : "font-normal opacity-60 hover:opacity-90"}`}
              style={
                activeNav === n.key
                  ? {
                      background: "linear-gradient(90deg,#f5a62322,#e8404011)",
                      color: "#f5a623",
                    }
                  : { color: "#9ca3af" }
              }
            >
              <Icon
                d={icons[n.key] ?? icons.overview}
                size={16}
                className="flex-shrink-0"
              />
              {sidebarOpen && <span>{n.label}</span>}
            </button>
          ))}
        </nav>

        {/* pro badge */}
        {sidebarOpen && (
          <div
            className="mx-3 mb-4 p-3 rounded-xl"
            style={{ background: "#1e2235", border: "1px solid #f5a62333" }}
          >
            <div
              className="flex items-center gap-1.5 text-xs font-semibold"
              style={{ color: "#f5a623" }}
            >
              ⭐ Pro Plan
            </div>
            <div className="text-[10px] mt-1" style={{ color: "#6b7280" }}>
              Renews Jun 30, 2024
            </div>
            <button
              className="mt-2 text-[10px] px-2 py-1 rounded-lg w-full"
              style={{
                background: "#f5a62322",
                color: "#f5a623",
                border: "1px solid #f5a62344",
              }}
            >
              Manage Plan
            </button>
          </div>
        )}

        {/* collapse toggle */}
        <button
          onClick={() => setSidebarOpen((o) => !o)}
          className="mx-3 mb-3 flex items-center justify-center py-2 rounded-xl transition-colors"
          style={{ background: "#1e2235", color: "#6b7280" }}
        >
          <Icon
            d={sidebarOpen ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"}
            size={14}
          />
        </button>
      </aside>

      {/* ── MAIN ────────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* ── TOPBAR ── */}
        <header
          className="px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid #252840", background: "#13151f" }}
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Pizza Sales Overview
              </h1>
              <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>
                Track key metrics and performance insights across all stores.
              </p>
            </div>
            <button
              className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg transition-colors hover:opacity-80"
              style={{
                background: "#e8404022",
                color: "#e84040",
                border: "1px solid #e8404033",
              }}
            >
              <Icon d="M18 6L6 18M6 6l12 12" size={12} /> Clear All Filters
            </button>
          </div>

          {/* filter row */}
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              {
                key: "dateRange",
                icon: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
                label: "Date Range",
                val: filters.dateRange,
              },
              {
                key: "store",
                icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
                label: "Store",
                val: filters.store,
              },
              {
                key: "region",
                icon: "M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z",
                label: "Region",
                val: filters.region,
              },
              {
                key: "category",
                icon: "M12 2a10 10 0 100 20A10 10 0 0012 2z",
                label: "Category",
                val: filters.category,
              },
              {
                key: "size",
                icon: "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
                label: "Size",
                val: filters.size,
              },
              {
                key: "launch",
                icon: "M22 12h-4l-3 9L9 3l-3 9H2",
                label: "Launch Period",
                val: filters.launch,
              },
            ].map((f) => (
              <div
                key={f.key}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs cursor-pointer hover:opacity-90 transition-opacity"
                style={{
                  background: "#1e2235",
                  border: "1px solid #252840",
                  color: "#9ca3af",
                }}
              >
                <Icon
                  d={f.icon}
                  size={12}
                  className="flex-shrink-0"
                  style={{ color: "#f5a623" }}
                />
                <span style={{ color: "#6b7280" }}>{f.label}</span>
                <span className="font-medium" style={{ color: "#e5e7eb" }}>
                  {f.val}
                </span>
                <Icon d="M6 9l6 6 6-6" size={10} />
              </div>
            ))}
          </div>

          {/* active pills */}
          {activePills.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs" style={{ color: "#6b7280" }}>
                Active Filters:
              </span>
              {activePills.map(([k, v]) => (
                <FilterPill
                  key={k}
                  label={`${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`}
                  onRemove={() => removeFilter(k)}
                />
              ))}
            </div>
          )}
        </header>

        {/* ── GRID ── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* KPI row */}
          <div className="grid grid-cols-5 gap-3">
            {KPI_CARDS.map((k, i) => (
              <div
                key={i}
                className="rounded-2xl p-4 flex flex-col gap-1 cursor-pointer hover:scale-[1.02] transition-transform"
                style={{
                  background: "#1a1d27",
                  border: `1px solid ${k.color}22`,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "#6b7280" }}>
                    {k.label}
                  </span>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: `${k.color}22` }}
                  >
                    <Icon d={k.icon} size={14} style={{ color: k.color }} />
                  </div>
                </div>
                <div
                  className="text-xl font-bold tracking-tight mt-0.5"
                  style={{ color: "#f9fafb" }}
                >
                  {k.value}
                </div>
                <div
                  className="text-xs font-medium"
                  style={{ color: "#4caf50" }}
                >
                  {k.delta}{" "}
                  <span style={{ color: "#6b7280" }}>vs Apr 1 – Apr 30</span>
                </div>
              </div>
            ))}
          </div>

          {/* row 2 – 4 charts */}
          <div className="grid grid-cols-4 gap-3">
            {/* 1. top 10 best-selling */}
            <Card title="1. Top 10 Best-Selling Pizzas">
              <BarChart
                data={TOP_PIZZAS}
                colorKey="#e84040"
                horizontal
                height={160}
              />
            </Card>

            {/* 2. top 10 by revenue */}
            <Card title="2. Top 10 Pizzas by Revenue">
              <BarChart
                data={TOP_PIZZAS_REVENUE.map((d) => ({
                  ...d,
                  val: d.rev,
                  label: d.name.split(" ")[0],
                }))}
                colorKey="#4caf50"
                height={180}
              />
            </Card>

            {/* 3. sales by size */}
            <Card title="3. Sales by Size">
              <div className="flex items-center gap-4 mt-1">
                <div className="relative flex-shrink-0">
                  <DonutChart segments={SIZE_DATA} size={110} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span
                      className="text-xs font-bold"
                      style={{ color: "#f9fafb" }}
                    >
                      28,451
                    </span>
                    <span className="text-[9px]" style={{ color: "#6b7280" }}>
                      Total Pizzas
                    </span>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs">
                  {SIZE_DATA.map((s, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: s.color }}
                      />
                      <span style={{ color: "#9ca3af" }}>{s.label}</span>
                      <span
                        className="ml-auto font-semibold"
                        style={{ color: "#e5e7eb" }}
                      >
                        {s.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* 4. revenue by category */}
            <Card title="4. Revenue by Category">
              <div className="flex items-center gap-4 mt-1">
                <div className="relative flex-shrink-0">
                  <DonutChart segments={CAT_DATA} size={110} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span
                      className="text-xs font-bold"
                      style={{ color: "#f9fafb" }}
                    >
                      $1.25M
                    </span>
                    <span className="text-[9px]" style={{ color: "#6b7280" }}>
                      Revenue
                    </span>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs">
                  {CAT_DATA.map((c, i) => (
                    <div key={i} className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: c.color }}
                        />
                        <span style={{ color: "#9ca3af" }}>{c.label}</span>
                      </div>
                      <span
                        className="ml-3.5 font-semibold text-[10px]"
                        style={{ color: "#e5e7eb" }}
                      >
                        {c.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* row 3 */}
          <div className="grid grid-cols-4 gap-3">
            {/* 5. monthly trend */}
            <Card title="5. Monthly Revenue Trend" className="col-span-1">
              <LineChart data={MONTHLY_REVENUE} color="#f5a623" height={120} />
              <div
                className="flex justify-between text-[10px] mt-0.5"
                style={{ color: "#6b7280" }}
              >
                {MONTHLY_REVENUE.map((d) => (
                  <span key={d.label}>{d.label}</span>
                ))}
              </div>
            </Card>

            {/* 6. orders by weekday */}
            <Card title="6. Orders by Weekday">
              <BarChart data={ORDERS_BY_DAY} colorKey="#f5a623" height={130} />
            </Card>

            {/* 7. orders by hour – heatmap placeholder */}
            <Card title="7. Orders by Hour">
              <div
                className="grid mt-1"
                style={{ gridTemplateColumns: "repeat(8,1fr)", gap: 3 }}
              >
                {["12A", "4A", "8A", "12P", "4P", "8P", "11P"].map((h) => (
                  <div
                    key={h}
                    className="text-center text-[8px]"
                    style={{ color: "#6b7280", gridColumn: "span 1" }}
                  >
                    {h}
                  </div>
                ))}
                <div />
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day) => (
                    <>
                      <div
                        key={day}
                        className="text-[8px] flex items-center"
                        style={{ color: "#6b7280" }}
                      >
                        {day}
                      </div>
                      {[12, 22, 36, 45, 38, 28, 18].map((v, j) => (
                        <div
                          key={j}
                          className="rounded-sm"
                          style={{
                            height: 14,
                            background: heatColor(
                              v + j * 2 + (day === "Fri" ? 8 : 0),
                            ),
                          }}
                        />
                      ))}
                    </>
                  ),
                )}
              </div>
              <div
                className="flex items-center justify-between mt-2 text-[9px]"
                style={{ color: "#6b7280" }}
              >
                <span>Low Orders</span>
                <div className="flex gap-px">
                  {[10, 18, 26, 34, 42, 46].map((v) => (
                    <div
                      key={v}
                      className="w-4 h-2 rounded-sm"
                      style={{ background: heatColor(v) }}
                    />
                  ))}
                </div>
                <span>High Orders</span>
              </div>
            </Card>

            {/* 8. top stores */}
            <Card title="8. Top Stores by Revenue">
              <div className="space-y-2 mt-1">
                {TOP_STORES.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                      style={{
                        background: i === 0 ? "#f5a623" : "#252840",
                        color: i === 0 ? "#0f1117" : "#9ca3af",
                      }}
                    >
                      {s.rank}
                    </span>
                    <span
                      className="flex-1 truncate"
                      style={{ color: "#e5e7eb" }}
                    >
                      {s.name}
                    </span>
                    <span
                      className="font-semibold"
                      style={{ color: "#f9fafb" }}
                    >
                      {s.rev}
                    </span>
                    <span className="font-medium" style={{ color: "#4caf50" }}>
                      {s.delta}
                    </span>
                  </div>
                ))}
                <button
                  className="text-[10px] mt-1 w-full text-right hover:opacity-80"
                  style={{ color: "#f5a623" }}
                >
                  View all stores →
                </button>
              </div>
            </Card>
          </div>

          {/* row 4 – store matrix + insights */}
          <div className="grid grid-cols-3 gap-3">
            {/* 9. pizza perf by store */}
            <Card title="9. Pizza Performance by Store" className="col-span-2">
              <div className="overflow-x-auto mt-1">
                <table
                  className="text-[10px] w-full border-separate"
                  style={{ borderSpacing: "2px 2px" }}
                >
                  <thead>
                    <tr>
                      <th
                        className="text-left px-1 pb-1"
                        style={{ color: "#6b7280", fontWeight: 500 }}
                      >
                        Revenue (in $K)
                      </th>
                      {PIZZA_COLS.map((c) => (
                        <th
                          key={c}
                          className="px-1 pb-1 text-right"
                          style={{
                            color: "#6b7280",
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {c.split(" ")[0]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {STORE_MATRIX.map((row, ri) => (
                      <tr key={ri}>
                        <td
                          className="px-1 py-0.5 whitespace-nowrap"
                          style={{ color: "#9ca3af" }}
                        >
                          {row.store}
                        </td>
                        {row.vals.map((v, ci) => (
                          <td
                            key={ci}
                            className="text-center rounded-md font-semibold px-1 py-1"
                            style={{
                              background: heatColor(v * 1.5),
                              color: "#0f1117",
                              minWidth: 32,
                            }}
                          >
                            {v}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* 10. insights */}
            <Card title="10. Key Insights">
              <div className="space-y-3 mt-1">
                {INSIGHTS.map((ins, i) => (
                  <div
                    key={i}
                    className="flex gap-3 p-2.5 rounded-xl"
                    style={{
                      background: "#13151f",
                      border: "1px solid #252840",
                    }}
                  >
                    <span className="text-lg flex-shrink-0 mt-0.5">
                      {ins.icon}
                    </span>
                    <div>
                      <div
                        className="text-xs font-semibold"
                        style={{ color: "#f5a623" }}
                      >
                        {ins.title}
                      </div>
                      <div
                        className="text-[11px] mt-0.5 leading-snug"
                        style={{ color: "#9ca3af" }}
                      >
                        {ins.body}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
        {/* end grid */}
      </main>
    </div>
  )
}
