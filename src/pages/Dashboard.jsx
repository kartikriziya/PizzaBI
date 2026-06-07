import React from "react"

export default function Dashboard() {
  return (
    <div className="space-y-4">
      {/* Placeholder content for your primary dashboard layout metrics panels */}
      <h1 className="text-2xl font-bold text-pizzabi-gold">Main Dashboard</h1>
      <p className="text-pizzabi-muted text-sm">
        Welcome back! Your core real-time analytics monitoring cards and sales
        data views will mount inside this frame.
      </p>

      {/* Ready-to-use playground panel wrapper container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-pizzabi-card border border-pizzabi-muted/10 p-6 rounded-xl h-32 flex items-center justify-center text-pizzabi-muted text-xs font-medium">
          Metric Slate Box 1
        </div>
        <div className="bg-pizzabi-card border border-pizzabi-muted/10 p-6 rounded-xl h-32 flex items-center justify-center text-pizzabi-muted text-xs font-medium">
          Metric Slate Box 2
        </div>
        <div className="bg-pizzabi-card border border-pizzabi-muted/10 p-6 rounded-xl h-32 flex items-center justify-center text-pizzabi-muted text-xs font-medium">
          Metric Slate Box 3
        </div>
      </div>
    </div>
  )
}
