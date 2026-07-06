import React, { useEffect, useMemo, useState } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { COLORS, tooltipStyle } from "../constants/data"
import { getAreaChartData } from "../apis/chartApi.js"
import { formatRangeValue } from "./DateRangePicker"

export default function ChartArea({ selectedFilters }) {
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
        const result = await getAreaChartData(selectedFilters)
        setData(result)
      } catch (error) {
        console.error("Failed to load area chart data", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [selectedFilters])

  return (
    <div className="bg-pizzabi-card border border-pizzabi-muted/20 rounded-xl p-5 md:col-span-2">
      <p className="text-pizzabi-muted text-xs mb-0.5">Orders by hour</p>
      <h2 className="text-pizzabi-gold font-medium text-lg mb-4">{rangeLabel}</h2>

      <div className="relative">
        <ResponsiveContainer width="100%" height={240}>
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-pizzabi-muted">
              Loading chart...
            </div>
          ) : (
            <AreaChart
              data={data}
              margin={{ top: 32, right: 16, bottom: 0, left: 8 }}
            >
              <defs>
                <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
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
                dataKey="hour"
                tick={{ fontSize: 11, fill: "var(--color-pizzabi-muted)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}:00`}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--color-pizzabi-muted)" }}
                tickLine={false}
                axisLine={false}
                width={36}
              />
              <Tooltip
                {...tooltipStyle}
                labelFormatter={(value) => {
                  const hour = parseInt(value)
                  const isPm = hour >= 12
                  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
                  return `Time : ${displayHour}:00 ${isPm ? "pm" : "am"}`
                }}
                formatter={(value) => [value, "Orders"]}
              />
              <Area
                type="monotone"
                dataKey="orders"
                stroke={COLORS.gold}
                strokeWidth={2}
                fill="url(#ordersGradient)"
                fillOpacity={1}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0, fill: COLORS.gold }}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>

        <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 -rotate-90 text-xs text-pizzabi-muted flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-pizzabi-gold inline-block" />
          <span>Orders</span>
        </div>

        <div className="absolute bottom--1 left-1/2 transform -translate-x-1/2 text-xs text-pizzabi-muted">
          Time
        </div>
      </div>
    </div>
  )
}
