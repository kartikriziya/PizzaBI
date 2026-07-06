// ----- Jahn 06.07 ------
import { useEffect, useMemo, useState } from "react"
import {
  ResponsiveContainer,
  ScatterChart,
  XAxis,
  YAxis,
  Scatter,
  Tooltip,
} from "recharts"
import { getCoMatrixData } from "../apis/chartApi"

// ----- Jahn 06.07 ------
// Fixed chart height (same idea as every other chart's ResponsiveContainer
// height={240}); width comes from ResponsiveContainer's own onResize, which is
// the same battle-tested resize handling every other chart here already uses —
// no custom ResizeObserver, so no risk of a grid/flex sizing feedback loop.
const CHART_HEIGHT = 420
// ----- Jahn 06.07 ------
const SQUARE_RATIO = 0.86 // leaves a small surface gap between cells
const MARGIN = { top: 110, right: 16, bottom: 16, left: 128 }

// Single-hue sequential ramp (gold) mixed against the current surface color,
// so intensity reads correctly in both light and dark mode.
function rampColor(ratio) {
  const pct = Math.round(14 + ratio * 76)
  return `color-mix(in oklch, var(--color-pizzabi-gold) ${pct}%, var(--color-pizzabi-card) ${100 - pct}%)`
}

function cellFill(value, max) {
  if (!value) {
    return "color-mix(in oklch, var(--color-pizzabi-muted) 10%, var(--color-pizzabi-card) 90%)"
  }
  return rampColor(max === 0 ? 0 : value / max)
}

// ----- Jahn 06.07 ------
// Width and height per cell are computed separately (width from the measured
// container, height from the fixed chart height) and applied independently —
// deliberately NOT assumed equal, so the drawn rect always matches Recharts'
// actual per-axis pixel spacing on both axes, even though cells aren't perfect
// squares at every width.
function CellShape({ cx, cy, payload }) {
  if (cx == null || cy == null) return null
  const w = payload.cellWidth * SQUARE_RATIO
  const h = payload.cellHeight * SQUARE_RATIO
  return (
    <rect
      x={cx - w / 2}
      y={cy - h / 2}
      width={w}
      height={h}
      rx={6}
      fill={cellFill(payload.value, payload.max)}
      style={{ cursor: payload.isDiagonal ? "default" : "crosshair" }}
    />
  )
}
// ----- Jahn 06.07 ------

function ColumnTick({ x, y, payload, products }) {
  return (
    <text
      x={x}
      y={y}
      dy={-6}
      textAnchor="start"
      transform={`rotate(-40, ${x}, ${y})`}
      fontSize={12}
      fontWeight={600}
      fill="var(--color-pizzabi-muted)"
    >
      {products[payload.value] ?? ""}
    </text>
  )
}

function RowTick({ x, y, payload, reversedProducts }) {
  return (
    <text
      x={x}
      y={y}
      dy={4}
      textAnchor="end"
      fontSize={12}
      fontWeight={600}
      fill="var(--color-pizzabi-muted)"
    >
      {reversedProducts[payload.value] ?? ""}
    </text>
  )
}

function MatrixTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  if (point.isDiagonal) return null

  return (
    <div className="rounded-xl border border-pizzabi-muted/20 bg-pizzabi-card px-4 py-2.5 shadow-2xl">
      <div className="text-sm font-bold text-pizzabi-gold">
        {point.rowName} + {point.colName}
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

export default function ChartCoMatrix({ selectedFilters = {} }) {
  const [products, setProducts] = useState([])
  const [matrix, setMatrix] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // ----- Jahn 06.07 ------
  // Recharts' own resize handling (same mechanism ChartLine/ChartPie/etc. use
  // via ResponsiveContainer) instead of a hand-rolled ResizeObserver.
  const [chartWidth, setChartWidth] = useState(0)
  // ----- Jahn 06.07 ------

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      try {
        setLoading(true)
        const result = await getCoMatrixData(selectedFilters)
        if (!isMounted) return
        setProducts(result.products || [])
        setMatrix(result.matrix || [])
        setError("")
      } catch (err) {
        console.error("Failed to load co-occurrence matrix", err)
        if (isMounted) setError("Unable to load the co-occurrence matrix.")
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadData()
    return () => {
      isMounted = false
    }
  }, [selectedFilters])

  const n = products.length

  const { points, max } = useMemo(() => {
    let maxValue = 0
    const list = []
    for (let row = 0; row < n; row++) {
      for (let col = 0; col < n; col++) {
        const isDiagonal = row === col
        const value = isDiagonal ? 0 : matrix[row]?.[col] || 0
        if (value > maxValue) maxValue = value
        list.push({
          x: col,
          y: n - 1 - row, // row 0 renders at the top
          value,
          isDiagonal,
          rowName: products[row],
          colName: products[col],
        })
      }
    }
    return { points: list, max: maxValue }
  }, [matrix, products, n])

  // ----- Jahn 06.07 ------
  const cellWidth = useMemo(() => {
    if (n === 0 || chartWidth === 0) return 0
    return Math.max(4, (chartWidth - MARGIN.left - MARGIN.right) / n)
  }, [chartWidth, n])

  const cellHeight = useMemo(() => {
    if (n === 0) return 0
    return Math.max(4, (CHART_HEIGHT - MARGIN.top - MARGIN.bottom) / n)
  }, [n])
  // ----- Jahn 06.07 ------

  const pointsWithMax = useMemo(
    () => points.map((p) => ({ ...p, max, cellWidth, cellHeight })),
    [points, max, cellWidth, cellHeight],
  )

  const reversedProducts = useMemo(() => [...products].reverse(), [products])
  const ticks = useMemo(() => Array.from({ length: n }, (_, i) => i), [n])

  return (
    // ----- Jahn 06.07 ------
    // Same card shell as every other chart (ChartLine, ChartPie, ...) so the
    // matrix has a visible border/background instead of sitting bare on the page.
    <div className="w-full bg-pizzabi-card border border-pizzabi-muted/20 rounded-xl p-5">
      {/* ----- Jahn 06.07 ------ */}
      <h2 className="text-pizzabi-gold font-bold text-base mb-1">
        Pizza Co-Occurrence Matrix
      </h2>
      <p className="text-pizzabi-muted text-xs mb-6">
        Wie oft werden zwei Pizzen gemeinsam in einer Bestellung bestellt —
        hover für Details
      </p>

      {error && <p className="mb-4 text-sm text-pizzabi-red">{error}</p>}

      {loading ? (
        <div className="flex h-40 items-center justify-center text-sm text-pizzabi-muted">
          Loading matrix...
        </div>
      ) : n === 0 ? (
        <div className="flex h-40 items-center justify-center text-sm text-pizzabi-muted">
          No data available for the current filters.
        </div>
      ) : (
        <ResponsiveContainer
          width="100%"
          height={CHART_HEIGHT}
          onResize={(width) => setChartWidth(width)}
        >
          <ScatterChart margin={MARGIN}>
            <XAxis
              type="number"
              dataKey="x"
              domain={[-0.5, n - 0.5]}
              ticks={ticks}
              orientation="top"
              axisLine={false}
              tickLine={false}
              interval={0}
              tick={(props) => <ColumnTick {...props} products={products} />}
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={[-0.5, n - 0.5]}
              ticks={ticks}
              axisLine={false}
              tickLine={false}
              interval={0}
              tick={(props) => (
                <RowTick {...props} reversedProducts={reversedProducts} />
              )}
            />
            <Tooltip content={<MatrixTooltip />} cursor={false} />
            <Scatter
              data={pointsWithMax}
              shape={CellShape}
              isAnimationActive={false}
            />
          </ScatterChart>
        </ResponsiveContainer>
      )}
      {/* ----- Jahn 06.07 ------ */}

      {/* ── Colour legend ── */}
      {!loading && n > 0 && (
        <div
          className="flex items-center gap-2 mt-4"
          style={{ marginLeft: MARGIN.left }}
        >
          <span className="text-xs text-pizzabi-muted">Selten</span>
          <div className="flex gap-[3px]">
            {Array.from({ length: 9 }, (_, i) => (
              <div
                key={i}
                className="rounded-sm"
                style={{
                  width: 26,
                  height: 14,
                  background: rampColor((i + 1) / 9),
                }}
              />
            ))}
          </div>
          <span className="text-xs text-pizzabi-muted">Häufig</span>
        </div>
      )}
    </div>
  )
}
// ----- Jahn 06.07 ------
