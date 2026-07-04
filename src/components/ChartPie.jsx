import React, { useEffect, useState } from "react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { SIZE_COLORS, tooltipStyle } from "../constants/data"
import { getSizeChartData } from "../apis/chartApi.js"

const RADIAN = Math.PI / 180

function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={500}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function ChartPie({ selectedFilters }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const result = await getSizeChartData(selectedFilters)
        setData(result)
      } catch (error) {
        console.error("Failed to load size chart data", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [selectedFilters])

  return (
    <div className="bg-pizzabi-card border border-pizzabi-muted/20 rounded-xl p-5">
      <p className="text-pizzabi-muted text-xs mb-0.5">Sales by size</p>
      <h2 className="text-white font-medium text-lg mb-4">Size distribution</h2>

      <div className="flex flex-wrap gap-3 mb-3 text-xs text-pizzabi-muted">
        {data.map((d, i) => (
          <span key={d.name} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm inline-block"
              style={{ background: SIZE_COLORS[i] }}
            />
            {d.name} {d.value}%
          </span>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={240}>
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-pizzabi-muted">
            Loading chart...
          </div>
        ) : (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              labelLine={false}
              label={CustomLabel}
            >
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={SIZE_COLORS[i]}
                  fillOpacity={0.8}
                  stroke={SIZE_COLORS[i]}
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              {...tooltipStyle}
              formatter={(value) => [`${value}%`, "Share"]}
            />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
