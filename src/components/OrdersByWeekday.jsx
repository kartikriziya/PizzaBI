import React, { useEffect, useState } from "react"
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
import { COLORS, tooltipStyle } from "../constants/data"
import { getWeekdayChartData } from "../apis/chartApi.js"

export default function OrdersByWeekday({ selectedFilters }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const result = await getWeekdayChartData(selectedFilters)
        setData(result)
      } catch (error) {
        console.error("Failed to load weekday chart data", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [selectedFilters])

  return (
    <div className="bg-pizzabi-card border border-pizzabi-muted/20 rounded-xl p-5">
      <p className="text-pizzabi-muted text-xs mb-0.5">Orders by weekday</p>
      <h2 className="text-white font-medium text-lg mb-4">Orders by weekday</h2>

      <ResponsiveContainer width="100%" height={240}>
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-pizzabi-muted">
            Loading chart...
          </div>
        ) : (
          <BarChart
            data={data}
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
        )}
      </ResponsiveContainer>
    </div>
  )
}
