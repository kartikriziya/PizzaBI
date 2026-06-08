import React from "react"
import { ResponsiveContainer, Tooltip, Treemap } from "recharts"
import { treemapData } from "../constants/data"

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null

  const entry = payload[0]?.payload
  if (!entry) return null

  return (
    <div
      style={{
        background: "var(--color-pizzabi-main)",
        border: "1px solid var(--color-pizzabi-muted)",
        borderRadius: 8,
        fontSize: 12,
        color: "var(--color-pizzabi-muted)",
        padding: "10px 12px",
      }}
    >
      <p style={{ margin: "0 0 6px", color: "white", fontWeight: 500 }}>
        {entry.name}
      </p>
      <p style={{ margin: 0 }}>Orders: {entry.value}</p>
    </div>
  )
}

const CustomizedContent = (props) => {
  const { x, y, width, height, name, fill } = props

  if (width < 60 || height < 36) {
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill,
            stroke: "rgba(255,255,255,0.08)",
            strokeWidth: 2,
          }}
          rx={8}
        />
      </g>
    )
  }

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill,
          stroke: "rgba(255,255,255,0.08)",
          strokeWidth: 2,
        }}
        rx={10}
      />
      <text
        x={x + 10}
        y={y + 20}
        fill="white"
        fontSize={12}
        fontWeight={500}
      >
        {name}
      </text>
    </g>
  )
}

export default function ChartTreeMap() {
  return (
    <div className="bg-pizzabi-card border border-pizzabi-muted/20 rounded-xl p-5">
      <p className="text-pizzabi-muted text-xs mb-0.5">Pizza Category share</p>
      <h2 className="text-white font-medium text-lg mb-4">TreeMap · May 1-30, 2024</h2>

      <ResponsiveContainer width="100%" height={280}>
        <Treemap
          data={treemapData}
          dataKey="value"
          nameKey="name"
          aspectRatio={4 / 3}
          stroke="rgba(255,255,255,0.08)"
          content={<CustomizedContent />}
        >
          <Tooltip content={<CustomTooltip />} />
        </Treemap>
      </ResponsiveContainer>
    </div>
  )
}