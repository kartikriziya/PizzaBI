import React from "react"
import ChartLine from "./ChartLine"
import ChartBar from "./ChartBar"
import ChartPie from "./ChartPie"
import ChartArea from "./ChartArea"
import ChartRadar from "./ChartRadar"
import ChartTreeMap from "./ChartTreeMap"
import OrdersByWeekday from "./OrdersByWeekday"
import Kpi from "./Kpi"

export default function Charts() {
  return (
    <div className="w-full bg-pizzabi-card p-4 md:p-6">
      <Kpi />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartLine />
        <ChartBar />
        <OrdersByWeekday />
        <ChartPie />
        <ChartArea />
        <ChartRadar />
        <ChartTreeMap />
      </div>
    </div>
  )
}
