import React from "react"
import ChartLine from "./ChartLine"
import ChartBar from "./ChartBar"
import ChartPie from "./ChartPie"
import ChartArea from "./ChartArea"
import ChartRadar from "./ChartRadar"
import ChartTreeMap from "./ChartTreeMap"

export default function Charts() {
  return (
    <div className="w-full bg-pizzabi-card p-4 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartLine />
        <ChartBar />
        <ChartPie />
        <ChartArea />
        <ChartRadar />
        <ChartTreeMap />
      </div>
    </div>
  )
}
