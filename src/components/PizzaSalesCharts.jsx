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
