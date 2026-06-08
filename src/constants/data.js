// data.js

export const dailyData = Array.from({ length: 30 }, (_, i) => ({
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

export const categoryData = [
  { name: "Classic", orders: 340 },
  { name: "Veggie", orders: 210 },
  { name: "BBQ Chicken", orders: 185 },
  { name: "Supreme", orders: 160 },
  { name: "Pepperoni", orders: 145 },
]

export const areaData = categoryData.map((d) => ({
  name: d.name,
  [d.name]: d.orders,
}))

export const categoryKeys = categoryData.map((d) => d.name)

export const sizeData = [
  { name: "Large", value: 42 },
  { name: "Medium", value: 31 },
  { name: "Small", value: 18 },
  { name: "XL", value: 9 },
]

export const COLORS = {
  gold: "var(--color-pizzabi-gold)",
  teal: "var(--color-pizzabi-teal)",
  amber: "var(--color-pizzabi-amber)",
  red: "var(--color-pizzabi-red)",
  green: "var(--color-pizzabi-green)",
}

export const SIZE_COLORS = [COLORS.gold, COLORS.teal, COLORS.amber, COLORS.red]
export const CAT_COLORS = [
  COLORS.gold,
  COLORS.teal,
  COLORS.amber,
  COLORS.green,
  COLORS.red,
]

export const radarData = [
  { region: "Chicago", orders: 84 },
  { region: "New York", orders: 72 },
  { region: "Miami", orders: 96 },
  { region: "Dallas", orders: 64 },
  { region: "Phoenix", orders: 78 },
  { region: "Minneapolis", orders: 88 },
]

export const treemapData = [
  { name: "Classic", value: 340, fill: "var(--color-pizzabi-gold)" },
  { name: "Veggie", value: 210, fill: "var(--color-pizzabi-teal)" },
  { name: "BBQ Chicken", value: 185, fill: "var(--color-pizzabi-amber)" },
  { name: "Supreme", value: 160, fill: "var(--color-pizzabi-green)" },
  { name: "Pepperoni", value: 145, fill: "var(--color-pizzabi-red)" },
  { name: "Margherita", value: 132, fill: "#7c6cf2" },
  { name: "Four Cheese", value: 118, fill: "#5aa6ff" },
  { name: "Hawaiian", value: 96, fill: "#f97316" },
]

export const tooltipStyle = {
  contentStyle: {
    background: "var(--color-pizzabi-main)",
    border: "1px solid var(--color-pizzabi-muted)",
    borderRadius: 8,
    fontSize: 12,
    color: "var(--color-pizzabi-muted)",
  },
  labelStyle: { color: "var(--color-pizzabi-muted)", marginBottom: 4 },
}
