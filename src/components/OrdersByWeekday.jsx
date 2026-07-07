import React, { useEffect, useState, useMemo } from "react"
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
import { formatRangeValue } from "./DateRangePicker"
import { getWeekdayChartData } from "../apis/chartApi.js"
import Loader from "./Loader"

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

  const rangeLabel = useMemo(() => {
    if (!selectedFilters?.startDate || !selectedFilters?.endDate) return "All Time"
    const start = new Date(selectedFilters.startDate)
    const end = new Date(selectedFilters.endDate)
    return formatRangeValue({ start, end })
  }, [selectedFilters])

  return (
    <div className="bg-pizzabi-card border border-pizzabi-muted/20 rounded-xl p-5">
      <p className="text-pizzabi-muted text-xs mb-0.5">Orders by weekday</p>
      <h2 className="text-pizzabi-gold font-medium text-lg mb-4">{rangeLabel}</h2>

      <div className="relative h-[240px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader size="md" message="Loading chart..." fullScreen={false} />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
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
          </ResponsiveContainer>
        )}

        <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 -rotate-90 text-xs text-pizzabi-muted">
          Orders
        </div>

        <div
          className="absolute bottom-0 left-1/2 text-xs text-pizzabi-muted"
          style={{ transform: 'translateX(-50%) translateY(15px)' }}
        >
          Weekday
        </div>
      </div>
    </div>
  )
}
