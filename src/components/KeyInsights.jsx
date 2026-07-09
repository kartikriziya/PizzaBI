import React, { useMemo } from "react"
import { TrendingUp, MapPin, Package, Zap, Star } from "lucide-react"
import LoadingState from "./LoadingState"

function InsightCard({ icon, title, value, description, color }) {
  return (
    <div className="rounded-2xl border border-pizzabi-muted/20 bg-pizzabi-card p-4 shadow-sm transition-all duration-200 cursor-pointer hover:border-pizzabi-gold/50">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-lg shrink-0 ${color}`}
        >
          {icon}
        </div>

        <div className="flex-1">
          <p className="text-xs text-pizzabi-muted font-medium">{title}</p>
          <h3 className="text-base font-semibold text-pizzabi-foreground mt-1">
            {value}
          </h3>
          <p className="text-xs text-pizzabi-muted/70 mt-2">{description}</p>
        </div>
      </div>
    </div>
  )
}

export default function KeyInsights({ overviewData, loading, error }) {
  const insights = useMemo(() => {
    if (!overviewData) {
      return []
    }

    const {
      kpiMetrics = {},
      categoryData = [],
      sizeData = [],
      radarData = [],
    } = overviewData
    const topCategory = [...categoryData].sort((a, b) => b.orders - a.orders)[0]
    const topSize = [...sizeData].sort((a, b) => b.value - a.value)[0]
    const topRegion = [...radarData].sort((a, b) => b.orders - a.orders)[0]

    return [
      {
        icon: <Star className="h-6 w-6 text-pizzabi-gold" />,
        title: "Best Seller of the Month",
        value: topCategory?.name || "No data",
        description: topCategory
          ? `${topCategory.name} leads the selected filter set by ${topCategory.orders} orders.`
          : "No category performance data is available for the current filters.",
        color: "bg-yellow-500/15",
      },
      {
        icon: <TrendingUp className="h-6 w-6 text-pizzabi-amber" />,
        title: "Best Performance",
        value: `$${Number(kpiMetrics.totalRevenue?.value || 0).toLocaleString()}`,
        description: `Revenue performance is ${kpiMetrics.totalRevenue?.delta || "currently unavailable"}.`,
        color: "bg-orange-500/15",
      },
      {
        icon: <MapPin className="h-6 w-6 text-pizzabi-teal" />,
        title: "Regional Favorite",
        value: topRegion?.region || "No data",
        description: topRegion
          ? `${topRegion.region} is the strongest region in the current selection.`
          : "No regional data is available for the current filters.",
        color: "bg-cyan-500/15",
      },
      {
        icon: <Package className="h-6 w-6 text-pizzabi-red" />,
        title: "Size Strategy",
        value: topSize?.name || "No data",
        description: topSize
          ? `${topSize.name} is the most represented size in the current filter scope.`
          : "No size breakdown is available for the current filters.",
        color: "bg-red-500/15",
      },
      {
        icon: <Zap className="h-6 w-6 text-pizzabi-green" />,
        title: "Growth Signal",
        value: `${kpiMetrics.totalOrders?.value || 0} orders`,
        description: kpiMetrics.totalOrders?.delta
          ? `Order volume change is ${kpiMetrics.totalOrders.delta}.`
          : "Order volume data is currently unavailable.",
        color: "bg-green-500/15",
      },
    ]
  }, [overviewData])

  if (loading && !overviewData) {
    return (
      <LoadingState
        loading
        message="Loading insights..."
        size="md"
        className="min-h-40 border-none bg-transparent"
      >
        <div className="w-full" />
      </LoadingState>
    )
  }

  if (error && !overviewData) {
    return <p className="text-sm text-pizzabi-red">{error}</p>
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="mb-1 text-lg font-bold text-pizzabi-gold">
          Key Insights
        </h3>
        <p className="text-sm text-pizzabi-muted">
          Key performance metrics and business intelligence
        </p>
      </div>
      <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
        {insights.map((insight, idx) => (
          <InsightCard
            key={idx}
            icon={insight.icon}
            title={insight.title}
            value={insight.value}
            description={insight.description}
            color={insight.color}
          />
        ))}
      </div>
    </div>
  )
}
