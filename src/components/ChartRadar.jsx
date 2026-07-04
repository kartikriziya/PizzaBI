import React, { useEffect, useState } from "react"
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { COLORS, tooltipStyle } from "../constants/data"
import { getRadarChartData } from "../apis/chartApi.js"

export default function ChartRadar({ selectedFilters }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const result = await getRadarChartData(selectedFilters)
        setData(result)
      } catch (error) {
        console.error("Failed to load radar chart data", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [selectedFilters])

  return (
    <div className="bg-pizzabi-card border border-pizzabi-muted/20 rounded-xl p-5">
      <p className="text-pizzabi-muted text-xs mb-0.5">Sales by region</p>
      <h2 className="text-white font-medium text-lg mb-4">USA regions</h2>

      <ResponsiveContainer width="100%" height={360}>
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-pizzabi-muted">
            Loading chart...
          </div>
        ) : (
          <RadarChart
            data={data}
            cx="48%"
            cy="48%"
            outerRadius="84%"
            margin={{ top: 10, right: 52, bottom: 10, left: 24 }}
          >
            <PolarGrid stroke="rgba(255,255,255,0.12)" />

            <PolarAngleAxis
              dataKey="region"
              tick={{ fill: "var(--color-pizzabi-muted)", fontSize: 12 }}
            />

            <PolarRadiusAxis
              angle={0}
              orientation="middle"
              domain={[0, 120]}
              ticks={[0, 30, 60, 90, 120]}
              tick={{
                fill: "var(--color-pizzabi-muted)",
                fontSize: 10,
                angle: 90,
              }}
              axisLine={false}
            />

            <Tooltip
              {...tooltipStyle}
              formatter={(value) => [`${value} orders`, "Orders"]}
            />

            <Radar
              name="Orders"
              dataKey="orders"
              stroke={COLORS.gold}
              fill={COLORS.gold}
              fillOpacity={0.35}
              strokeWidth={2}
            />
          </RadarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
