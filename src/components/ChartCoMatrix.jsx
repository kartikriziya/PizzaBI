import { useState } from "react"

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

// Symmetric co-occurrence — how often two pizzas appear in the same order
const MATRIX = [
  //  Marg  Pepp   Haw   Sal   Veg   BBQ   4K   Tonn
  [0, 342, 187, 203, 156, 98, 145, 87],
  [342, 0, 298, 267, 112, 189, 134, 76],
  [187, 298, 0, 145, 98, 167, 89, 134],
  [203, 267, 145, 0, 67, 134, 112, 89],
  [156, 112, 98, 67, 0, 78, 145, 56],
  [98, 189, 167, 134, 78, 0, 67, 45],
  [145, 134, 89, 112, 145, 67, 0, 78],
  [87, 76, 134, 89, 56, 45, 78, 0],
]

const MAX_VAL = Math.max(...MATRIX.flat())

function cellBg(value, isDiagonal) {
  if (isDiagonal) return "rgba(156,163,175,0.07)"
  const ratio = value / MAX_VAL
  return `rgba(255,159,28,${(0.08 + ratio * 0.82).toFixed(2)})`
}

// Layout constants
const CELL = 76 // cell width & height in px
const GAP = 5 // gap between cells
const ROW_LBL_W = 120 // row-label column width
const COL_HDR_H = 110 // column-header area height

export default function ChartCoMatrix() {
  const [tooltip, setTooltip] = useState(null)
  const n = PIZZAS.length
  const totalW = ROW_LBL_W + n * (CELL + GAP)

  return (
    <div className="w-full">
      <h2 className="text-pizzabi-gold font-bold text-base mb-1">
        Pizza Co-Occurrence Matrix
      </h2>
      <p className="text-pizzabi-muted text-xs mb-6">
        Wie oft werden zwei Pizzen gemeinsam in einer Bestellung bestellt —
        hover für Details
      </p>

      <div className="overflow-x-auto pb-2">
        <div style={{ width: totalW }}>
          {/* ── Column headers (vertical text, bottom-aligned) ── */}
          <div style={{ display: "flex", marginLeft: ROW_LBL_W }}>
            {PIZZAS.map((name) => (
              <div
                key={name}
                style={{
                  width: CELL,
                  marginRight: GAP,
                  height: COL_HDR_H,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  paddingBottom: 8,
                }}
              >
                <span
                  style={{
                    writingMode: "vertical-rl",
                    transform: "rotate(180deg)",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#9ca3af",
                    whiteSpace: "nowrap",
                    letterSpacing: "0.01em",
                  }}
                >
                  {name}
                </span>
              </div>
            ))}
          </div>

          {/* ── Matrix rows ── */}
          {PIZZAS.map((rowName, ri) => (
            <div
              key={rowName}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: GAP,
              }}
            >
              {/* Row label */}
              <div
                style={{
                  width: ROW_LBL_W,
                  flexShrink: 0,
                  textAlign: "right",
                  paddingRight: 14,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#9ca3af",
                  whiteSpace: "nowrap",
                  letterSpacing: "0.01em",
                }}
              >
                {rowName}
              </div>

              {/* Cells */}
              {PIZZAS.map((_, ci) => {
                const value = MATRIX[ri][ci]
                const isDiagonal = ri === ci
                const isHovered = tooltip?.ri === ri && tooltip?.ci === ci

                return (
                  <div
                    key={ci}
                    style={{
                      width: CELL,
                      height: CELL,
                      marginRight: GAP,
                      flexShrink: 0,
                      borderRadius: 6,
                      background: cellBg(value, isDiagonal),
                      outline: isHovered
                        ? "2px solid rgba(255,159,28,0.85)"
                        : "none",
                      outlineOffset: -1,
                      cursor: isDiagonal ? "default" : "crosshair",
                      transition: "outline 80ms",
                    }}
                    onMouseMove={(e) =>
                      !isDiagonal &&
                      setTooltip({ x: e.clientX, y: e.clientY, ri, ci })
                    }
                    onMouseLeave={() => setTooltip(null)}
                  />
                )
              })}
            </div>
          ))}

          {/* ── Colour legend ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 18,
              marginLeft: ROW_LBL_W,
            }}
          >
            <span style={{ fontSize: 12, color: "#9ca3af" }}>Selten</span>
            <div style={{ display: "flex", gap: 3 }}>
              {Array.from({ length: 9 }, (_, i) => {
                const ratio = (i + 1) / 9
                return (
                  <div
                    key={i}
                    style={{
                      width: 26,
                      height: 14,
                      borderRadius: 3,
                      background: `rgba(255,159,28,${(0.08 + ratio * 0.82).toFixed(2)})`,
                    }}
                  />
                )
              })}
            </div>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>Häufig</span>
          </div>
        </div>
      </div>

      {/* ── Fixed tooltip (escapes any overflow clipping) ── */}
      {tooltip && (
        <div
          className="fixed z-9999 pointer-events-none rounded-xl border border-pizzabi-muted/20 bg-pizzabi-card px-4 py-2.5 shadow-2xl"
          style={{ top: tooltip.y - 80, left: tooltip.x + 18 }}
        >
          <div className="text-sm font-bold text-pizzabi-gold">
            {PIZZAS[tooltip.ri]} + {PIZZAS[tooltip.ci]}
          </div>
          <div className="mt-1 text-xs text-pizzabi-muted">
            <span className="text-pizzabi-foreground font-bold text-sm">
              {MATRIX[tooltip.ri][tooltip.ci]}×
            </span>{" "}
            zusammen bestellt
          </div>
        </div>
      )}
    </div>
  )
}
