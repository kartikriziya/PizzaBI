import React from "react"
import ChartLine from "./ChartLine"
import ChartBar from "./ChartBar"
import ChartPie from "./ChartPie"
import ChartArea from "./ChartArea"
import ChartRadar from "./ChartRadar"
import OrdersByWeekday from "./OrdersByWeekday"
import Kpi from "./Kpi"

export default function Charts() {
  return (
    <div className="w-full flex flex-col">
      <div className="bg-pizzabi-card p-4 md:p-6 space-y-4">
        <Kpi />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartLine />
          <ChartBar />
          <OrdersByWeekday />
          <ChartPie />
          <ChartRadar />
          <ChartArea />
        </div>
      </div>
    </div>
  )
}
