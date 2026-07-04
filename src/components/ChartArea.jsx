import React from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { dailyData, COLORS, tooltipStyle } from "../constants/data"

export default function ChartArea() {
  return (
    <div className="bg-pizzabi-card border border-pizzabi-muted/20 rounded-xl p-5 md:col-span-2">
      <p className="text-pizzabi-muted text-xs mb-0.5">Revenue trend</p>
      <h2 className="text-white font-medium text-lg mb-4">Daily sales</h2>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart
          data={dailyData}
          margin={{ top: 32, right: 16, bottom: 0, left: 8 }}
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.gold} stopOpacity={0.35} />
              <stop offset="95%" stopColor={COLORS.gold} stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.06)"
            vertical={false}
          />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: "var(--color-pizzabi-muted)" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--color-pizzabi-muted)" }}
            tickLine={false}
            axisLine={false}
            width={36}
          />
          <Tooltip
            {...tooltipStyle}
            formatter={(value) => [`€${value}`, "Revenue"]}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke={COLORS.gold}
            strokeWidth={2}
            fill="url(#revenueGradient)"
            fillOpacity={1}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0, fill: COLORS.gold }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}