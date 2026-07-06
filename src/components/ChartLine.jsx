import React, { useEffect, useMemo, useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { COLORS, tooltipStyle } from "../constants/data"
import { getLineChartData } from "../apis/chartApi.js"
import { formatRangeValue } from "./DateRangePicker"

export default function ChartLine({ selectedFilters }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const rangeLabel = useMemo(() => {
    if (!selectedFilters?.startDate || !selectedFilters?.endDate)
      return "All Time"
    const start = new Date(selectedFilters.startDate)
    const end = new Date(selectedFilters.endDate)
    return formatRangeValue({ start, end })
  }, [selectedFilters])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const result = await getLineChartData(selectedFilters)
        setData(result)
      } catch (error) {
        console.error("Failed to load line chart data", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [selectedFilters])

  return (
    <div className="bg-pizzabi-card border border-pizzabi-muted/20 rounded-xl p-5 col-span-2">
      <p className="text-pizzabi-muted text-xs mb-0.5">Daily revenue</p>
      <h2 className="text-pizzabi-gold font-medium text-lg mb-4">{rangeLabel}</h2>

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

      <div className="relative">
        <ResponsiveContainer width="100%" height={240}>
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-pizzabi-muted">
              Loading chart...
            </div>
          ) : (
            <LineChart
              data={data}
              margin={{ top: 4, right: 20, bottom: 0, left: 10 }}
            >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.06)"
            />
            <XAxis
              dataKey="day"
              tick={false}
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
              labelFormatter={(label) => `Date: ${label}`}
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
          )}
        </ResponsiveContainer>

        <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 -rotate-90 text-xs text-pizzabi-muted flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-pizzabi-gold inline-block" />
          <span>Revenue</span>
        </div>

        <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 rotate-90 text-xs text-pizzabi-muted flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-pizzabi-teal inline-block" />
          <span>Orders</span>
        </div>

        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-pizzabi-muted">
          Date
        </div>
      </div>
    </div>
  )
}
