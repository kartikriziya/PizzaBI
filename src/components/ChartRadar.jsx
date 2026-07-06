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

function getNiceStep(maxValue, maxTicks = 5) {
  if (!Number.isFinite(maxValue) || maxValue <= 0) return 100000

  const roughStep = maxValue / Math.max(maxTicks - 1, 1)
  const magnitude = 10 ** Math.floor(Math.log10(roughStep))
  const fraction = roughStep / magnitude

  let niceFraction
  if (fraction <= 1) niceFraction = 1
  else if (fraction <= 2) niceFraction = 2
  else if (fraction <= 5) niceFraction = 5
  else niceFraction = 10

  return niceFraction * magnitude
}

export default function ChartRadar({ selectedFilters }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const maxValue = Math.max(...data.map((item) => Number(item.orders) || 0), 0)
  const tickStep = getNiceStep(maxValue)
  const radiusDomain = [0, Math.max(maxValue, tickStep)]
  const radiusTicks = Array.from(
    { length: Math.floor(radiusDomain[1] / tickStep) + 1 },
    (_, index) => index * tickStep,
  )

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
      <h2 className="text-pizzabi-gold font-medium text-lg mb-4">USA regions</h2>

      <div className="relative">
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
              <PolarGrid stroke="rgba(100,100,100,0.3)" />

              <PolarAngleAxis
                dataKey="region"
                tick={{ fill: "var(--color-pizzabi-muted)", fontSize: 12 }}
              />

              <PolarRadiusAxis
                angle={0}
                orientation="middle"
                domain={radiusDomain}
                ticks={radiusTicks}
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

        <div className="absolute top-3 right-3 bg-pizzabi-card/80 border border-pizzabi-muted/20 rounded-md px-3 py-1 text-xs flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-pizzabi-gold inline-block" />
          <span className="text-pizzabi-muted">Orders</span>
        </div>
      </div>
    </div>
  )
}
