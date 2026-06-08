import React from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { dailyData, COLORS, tooltipStyle } from "../constants/data"

export default function ChartLine() {
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
