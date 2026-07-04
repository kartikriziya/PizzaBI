import React, { useEffect, useState } from "react"
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { CAT_COLORS, tooltipStyle } from "../constants/data"
import { getCategoryChartData } from "../apis/chartApi.js"

export default function ChartBar({ selectedFilters }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const result = await getCategoryChartData(selectedFilters)
        setData(result)
      } catch (error) {
        console.error("Failed to load category chart data", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [selectedFilters])

  return (
    <div className="bg-pizzabi-card border border-pizzabi-muted/20 rounded-xl p-5">
      <p className="text-pizzabi-muted text-xs mb-0.5">Sales by category</p>
      <h2 className="text-white font-medium text-lg mb-4">Pizza types</h2>

      <div className="flex flex-wrap gap-3 mb-3 text-xs text-pizzabi-muted">
        {data.map((d, i) => (
          <span key={d.name} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm inline-block"
              style={{ background: CAT_COLORS[i] }}
            />
            {d.name}
          </span>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 0, right: 16, bottom: 0, left: 8 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.06)"
            horizontal={false}
          />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "var(--color-pizzabi-muted)" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12, fill: "var(--color-pizzabi-muted)" }}
            tickLine={false}
            axisLine={false}
            width={88}
          />
          <Tooltip
            {...tooltipStyle}
            itemStyle={{ color: "var(--color-pizzabi-gold)" }}
            formatter={(value) => [`${value} orders`, "Orders"]}
          />
          <Bar dataKey="orders" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={CAT_COLORS[i]}
                fillOpacity={0.85}
                stroke={CAT_COLORS[i]}
                strokeWidth={1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
