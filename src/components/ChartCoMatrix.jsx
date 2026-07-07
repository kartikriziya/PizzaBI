import { useEffect, useMemo, useState } from "react"
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { getCoOccurrenceMatrixData } from "../apis/chartApi.js"
import Loader from "./Loader"

const PIZZAS = [
  "Margherita",
  "Pepperoni",
  "Hawaii",
  "Salami",
  "Veggie",
  "BBQ Chicken",
  "Vier Käse",
  "Tonno",
]

export function cellColor(value, isDiagonal, maxValue = 1) {
  if (isDiagonal) return "rgba(156,163,175,0.08)"
  const ratio = maxValue > 0 ? value / maxValue : 0
  return `rgba(255,159,28,${(0.08 + ratio * 0.82).toFixed(2)})`
}

export function buildScatterData(matrix, pizzas) {
  return matrix.flatMap((row, y) =>
    row.map((value, x) => ({
      x,
      y,
      value: Number(value) || 0,
      pizzaX: pizzas[x],
      pizzaY: pizzas[y],
      diagonal: x === y,
    }))
  )
}

export function MatrixTooltip({ active, payload }) {
  if (!active || !payload?.length) return null

  const point = payload[0].payload

  return (
    <div className="rounded-xl border border-pizzabi-muted/20 bg-pizzabi-card px-4 py-2.5 shadow-2xl">
      <div className="text-sm font-bold text-pizzabi-gold">
        {point.pizzaY} + {point.pizzaX}
      </div>
      <div className="mt-1 text-xs text-pizzabi-muted">
        <span className="text-pizzabi-foreground font-bold text-sm">
          {point.value}×
        </span>{" "}
        zusammen bestellt
      </div>
    </div>
  )
}

function CustomYAxisTick({ x, y, payload, pizzas }) {
  const name = pizzas[payload.value] ?? ""
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={-12}
        y={4}
        fill="#9ca3af"
        fontSize={11}
        textAnchor="end"
        className="select-none font-medium"
      >
        {name.replace(" Pizza", "")}
      </text>
    </g>
  )
}

function CustomXAxisTick({ x, y, payload, pizzas }) {
  const name = pizzas[payload.value] ?? ""
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        fill="#9ca3af"
        fontSize={11}
        textAnchor="end"
        transform="rotate(-35)"
        className="select-none font-medium"
      >
        {name.replace(" Pizza", "")}
      </text>
    </g>
  )
}

export function MatrixCell({
  cx,
  cy,
  fill,
  payload,
  isHovered,
  onPointHover,
  onPointLeave,
}) {
  // Da die Zellen nun in die Breite gezogen werden, entfernen wir die feste quadratische Größe
  // und nutzen stattdessen ein Rechteck, das sich dem dynamischen Abstand (je nach Bildschirmbreite) anpasst.
  const width = 45  // Breiteres Rechteck, um den horizontalen Platz optimal zu füllen
  const height = 24 // Behält eine angenehme Höhe für die Zeilen

  const isDiagonal = payload?.diagonal

  return (
    <g
      onMouseEnter={() => onPointHover?.(payload)}
      onMouseLeave={() => onPointLeave?.()}
      style={{ cursor: isDiagonal ? "default" : "pointer" }}
    >
      <rect
        x={cx - width / 2}
        y={cy - height / 2}
        width={width}
        height={height}
        rx={4}
        ry={4}
        fill={fill}
        stroke={isHovered ? "#f59e0b" : "rgba(255,255,255,0.12)"}
        strokeWidth={isHovered ? 2.5 : 1}
        opacity={isDiagonal ? 0.6 : 1}
      />
    </g>
  )
}

export function CoOccurrenceMatrixChart({ selectedFilters = {} }) {
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const [matrix, setMatrix] = useState([])
  const [pizzas, setPizzas] = useState(PIZZAS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const result = await getCoOccurrenceMatrixData(selectedFilters)
        setPizzas(result?.pizzas || PIZZAS)
        setMatrix(result?.matrix || [])
      } catch (error) {
        console.error("Failed to load co-occurrence matrix data", error)
        setPizzas(PIZZAS)
        setMatrix([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [selectedFilters])

  const scatterData = useMemo(() => buildScatterData(matrix, pizzas), [matrix, pizzas])
  const maxValue = useMemo(() => {
    const values = matrix.flat().map((value) => Number(value) || 0)
    return values.length ? Math.max(...values) : 1
  }, [matrix])

  const axisDomain = Math.max(0, pizzas.length - 1)

  return (
    <div className="bg-pizzabi-card border border-pizzabi-muted/20 rounded-xl p-5 col-span-full">
      <p className="text-pizzabi-muted text-xs mb-0.5">Co-occurrence matrix</p>
      <h2 className="text-pizzabi-gold font-medium text-lg mb-4">
        Pizza pairing frequency
      </h2>

      <div className="relative h-[420px] md:h-[500px] overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader size="md" message="Loading matrix..." fullScreen={false} />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 16, right: 28, bottom: 70, left: 96 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" horizontal={true} vertical={true} />
              <XAxis
                type="number"
                dataKey="x"
                domain={[0, axisDomain]}
                tickCount={pizzas.length}
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                height={70}
                tick={<CustomXAxisTick pizzas={pizzas} />}
              />
              <YAxis
                type="number"
                dataKey="y"
                domain={[0, axisDomain]}
                tickCount={pizzas.length}
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                width={90}
                tick={<CustomYAxisTick pizzas={pizzas} />}
              />
              <Tooltip
                cursor={false}
                content={<MatrixTooltip />}
                animationDuration={150}
              />
              <Scatter
                name="Co-occurrence"
                data={scatterData}
                fill="#f59e0b"
                line={false}
                shape={(props) => (
                  <MatrixCell
                    {...props}
                    fill={cellColor(
                      props.payload?.value,
                      props.payload?.diagonal,
                      maxValue
                    )}
                    isHovered={
                      hoveredPoint?.x === props.payload?.x &&
                      hoveredPoint?.y === props.payload?.y
                    }
                    onPointHover={(payload) => setHoveredPoint(payload)}
                    onPointLeave={() => setHoveredPoint(null)}
                  />
                )}
                isAnimationActive
                animationBegin={0}
                animationDuration={500}
                animationEasing="ease-out"
              />
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        <span className="text-xs text-pizzabi-muted">Selten</span>
        <div className="flex gap-1">
          {Array.from({ length: 9 }, (_, i) => {
            const ratio = (i + 1) / 9
            return (
              <div
                key={i}
                className="h-3.5 rounded-sm"
                style={{
                  width: 40,
                  background: cellColor(ratio * maxValue, false, maxValue),
                }}
              />
            )
          })}
        </div>
        <span className="text-xs text-pizzabi-muted">Häufig</span>
      </div>
    </div>
  )
}

export default function ChartCoMatrix({ selectedFilters }) {
  return <CoOccurrenceMatrixChart selectedFilters={selectedFilters} />
}