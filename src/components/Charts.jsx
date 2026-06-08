import React from "react"
import ChartLine from "./ChartLine"
import ChartBar from "./ChartBar"

export default function Charts() {
  return (
    <div className="w-full bg-pizzabi-card p-4 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartLine />
        <ChartBar />
      </div>
    </div>
  )
}
