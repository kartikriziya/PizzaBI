import React from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts"
import { weekdayData, COLORS, tooltipStyle } from "../constants/data"

export default function OrdersByWeekday() {
  return (
    <div className="bg-pizzabi-card border border-pizzabi-muted/20 rounded-xl p-5">
      <p className="text-pizzabi-muted text-xs mb-0.5">Orders by weekday</p>
      <h2 className="text-white font-medium text-lg mb-4">Orders by weekday</h2>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={weekdayData}
          margin={{ top: 24, right: 16, bottom: 0, left: 8 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
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
            width={48}
          />

          <Tooltip
            {...tooltipStyle}
            itemStyle={{ color: "var(--color-pizzabi-gold)" }}
            formatter={(value) => [`${value.toLocaleString()}`, "Orders"]}
          />

          <Bar dataKey="orders" fill={COLORS.teal} radius={[6, 6, 0, 0]}>
            <LabelList
              dataKey="orders"
              position="top"
              formatter={(value) => value.toLocaleString()}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
