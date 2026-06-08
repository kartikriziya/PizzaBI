import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"

// ─── Dummy data (Apr 1–30, 2024 · City Center) ───────────────────────────────

const dailyData = Array.from({ length: 30 }, (_, i) => ({
  day: `Apr ${i + 1}`,
  revenue: [
    1420, 1650, 980, 2100, 1870, 2350, 2200, 1300, 1550, 1720, 1900, 2050, 1100,
    1450, 2300, 2180, 1650, 1380, 1700, 1980, 2400, 2250, 1600, 1450, 1300,
    1750, 2100, 1950, 1200, 1850,
  ][i],
  orders: [
    72, 83, 49, 105, 94, 118, 110, 65, 78, 87, 95, 103, 55, 73, 115, 109, 83,
    69, 85, 99, 120, 113, 80, 73, 65, 88, 105, 98, 60, 93,
  ][i],
}))

const categoryData = [
  { name: "Classic", orders: 340 },
  { name: "Veggie", orders: 210 },
  { name: "BBQ Chicken", orders: 185 },
  { name: "Supreme", orders: 160 },
  { name: "Pepperoni", orders: 145 },
]

const sizeData = [
  { name: "Large", value: 42 },
  { name: "Medium", value: 31 },
  { name: "Small", value: 18 },
  { name: "XL", value: 9 },
]

const COLORS = {
  gold: "var(--color-pizzabi-gold)",
  teal: "var(--color-pizzabi-teal)",
  amber: "var(--color-pizzabi-amber)",
  red: "var(--color-pizzabi-red)",
  green: "var(--color-pizzabi-green)",
}

const SIZE_COLORS = [COLORS.gold, COLORS.teal, COLORS.amber, COLORS.red]
const CAT_COLORS = [
  COLORS.gold,
  COLORS.teal,
  COLORS.amber,
  COLORS.green,
  COLORS.red,
]

// ─── Shared tooltip style ─────────────────────────────────────────────────────

const tooltipStyle = {
  contentStyle: {
    background: "var(--color-pizzabi-main)",
    border: "1px solid var(--color-pizzabi-muted)",
    borderRadius: 8,
    fontSize: 12,
    color: "var(--color-pizzabi-muted)",
  },
  labelStyle: { color: "var(--color-pizzabi-muted)", marginBottom: 4 },
}

// ─── Chart 1: Daily Revenue & Orders (dual-axis line) ────────────────────────

function DailyRevenueChart() {
  return (
    <div className="bg-pizzabi-card border border-pizzabi-muted/20 rounded-xl p-5 col-span-2">
      <p className="text-pizzabi-muted text-xs mb-0.5">Daily revenue</p>
      <h2 className="text-white font-medium text-lg mb-4">
        Apr 1–30, 2024 · City Center
      </h2>

      <div className="flex gap-5 mb-3 text-xs text-pizzabi-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-pizzabi-gold inline-block rounded" />
          Revenue ($)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 border-t-2 border-dashed border-pizzabi-teal inline-block" />
          Orders
        </span>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <LineChart
          data={dailyData}
          margin={{ top: 4, right: 20, bottom: 0, left: 10 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.06)"
          />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 10, fill: "var(--color-pizzabi-muted)" }}
            interval={4}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 11, fill: "var(--color-pizzabi-muted)" }}
            tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 11, fill: "var(--color-pizzabi-muted)" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            {...tooltipStyle}
            formatter={(value, name) =>
              name === "revenue"
                ? [`$${value.toLocaleString()}`, "Revenue"]
                : [value, "Orders"]
            }
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="revenue"
            stroke={COLORS.gold}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="orders"
            stroke={COLORS.teal}
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={true}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Chart 2: Sales by Category (horizontal bar) ─────────────────────────────

function CategoryChart() {
  return (
    <div className="bg-pizzabi-card border border-pizzabi-muted/20 rounded-xl p-5">
      <p className="text-pizzabi-muted text-xs mb-0.5">Sales by category</p>
      <h2 className="text-white font-medium text-lg mb-4">Pizza types</h2>

      <div className="flex flex-wrap gap-3 mb-3 text-xs text-pizzabi-muted">
        {categoryData.map((d, i) => (
          <span key={d.name} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm inline-block"
              style={{ background: CAT_COLORS[i] }}
            />
            {d.name}
          </span>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          layout="vertical"
          data={categoryData}
          margin={{ top: 0, right: 16, bottom: 0, left: 8 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.06)"
            horizontal={false}
          />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "var(--color-pizzabi-muted)" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12, fill: "var(--color-pizzabi-muted)" }}
            tickLine={false}
            axisLine={false}
            width={88}
          />
          <Tooltip
            {...tooltipStyle}
            formatter={(value) => [`${value} orders`, "Orders"]}
          />
          <Bar dataKey="orders" radius={[0, 4, 4, 0]}>
            {categoryData.map((_, i) => (
              <Cell
                key={i}
                fill={CAT_COLORS[i]}
                fillOpacity={0.85}
                stroke={CAT_COLORS[i]}
                strokeWidth={1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Chart 3: Size Distribution (donut) ──────────────────────────────────────

const RADIAN = Math.PI / 180
function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={500}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

function SizeChart() {
  return (
    <div className="bg-pizzabi-card border border-pizzabi-muted/20 rounded-xl p-5">
      <p className="text-pizzabi-muted text-xs mb-0.5">Sales by size</p>
      <h2 className="text-white font-medium text-lg mb-4">Size distribution</h2>

      <div className="flex flex-wrap gap-3 mb-3 text-xs text-pizzabi-muted">
        {sizeData.map((d, i) => (
          <span key={d.name} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm inline-block"
              style={{ background: SIZE_COLORS[i] }}
            />
            {d.name} {d.value}%
          </span>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={sizeData}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            labelLine={false}
            label={CustomLabel}
          >
            {sizeData.map((_, i) => (
              <Cell
                key={i}
                fill={SIZE_COLORS[i]}
                fillOpacity={0.8}
                stroke={SIZE_COLORS[i]}
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            {...tooltipStyle}
            formatter={(value) => [`${value}%`, "Share"]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Composed Dashboard ───────────────────────────────────────────────────────

export default function PizzaSalesCharts() {
  return (
    <div className="w-full bg-pizzabi-card p-4 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DailyRevenueChart />
        <CategoryChart />
        <SizeChart />
      </div>
    </div>
  )
}
