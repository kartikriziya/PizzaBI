import React from "react"

/**
 * Loader Component
 * ─────────────────
 * Simple rotating circle loader using PizzaBI theme colors
 * Displays as fullscreen overlay by default
 *
 * Props:
 * - size: 'sm' | 'md' | 'lg' (default: 'md')
 * - fullScreen: boolean - shows as fullscreen overlay (default: true)
 * - message: string - optional loading message
 */
export default function Loader({
  size = "md",
  fullScreen = true,
  message = null,
}) {
  const sizeMap = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  }

  const loader = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className={`${sizeMap[size]} relative`}
        style={{
          backgroundImage: `conic-gradient(from 0deg, #E8A658 0%, #D46420 50%, transparent 70%)`,
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      >
        <div
          className="absolute inset-1"
          style={{
            background: "#0f1117",
            borderRadius: "50%",
          }}
        />
      </div>
      {message && (
        <p className="text-sm font-medium" style={{ color: "#E8A658" }}>
          {message}
        </p>
      )}

      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{
          background: "rgba(15, 17, 23, 0.1)",
          backdropFilter: "blur(1px)",
        }}
      >
        {loader}
      </div>
    )
  }

  return loader
}
