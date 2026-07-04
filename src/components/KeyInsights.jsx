import React from "react"
import {
  TrendingUp,
  MapPin,
  Package,
  Zap,
  Star,
} from "lucide-react"

function InsightCard({ icon, title, value, description, color }) {
  return (
    <div 
      className="rounded-2xl border p-4 shadow-sm transition-all duration-200 cursor-pointer" 
      style={{ background: "#1a1d27", borderColor: "#2a2d3a" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#f5a623"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#2a2d3a"
      }}
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg flex-shrink-0 ${color}`}>
          {icon}
        </div>

        <div className="flex-1">
          <p className="text-xs text-pizzabi-muted font-medium">{title}</p>
          <h3 className="text-base font-semibold text-white mt-1">{value}</h3>
          <p className="text-xs text-pizzabi-muted/70 mt-2">{description}</p>
        </div>
      </div>
    </div>
  )
}

export default function KeyInsights() {
  const insights = [
    {
      icon: <Star className="h-6 w-6 text-pizzabi-gold" />,
      title: "Best Seller of the Month",
      value: "Margherita",
      description: "Margherita was the top-selling pizza with 2,436 pizzas sold.",
      color: "bg-yellow-500/15",
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-pizzabi-amber" />,
      title: "Best Performance",
      value: "Pepperoni",
      description: "Pepperoni generated the highest revenue at $1,429K.",
      color: "bg-orange-500/15",
    },
    {
      icon: <MapPin className="h-6 w-6 text-pizzabi-teal" />,
      title: "Regional Favorite",
      value: "BBQ Chicken",
      description: "BBQ Chicken performs best at Downtown and City Center stores.",
      color: "bg-cyan-500/15",
    },
    {
      icon: <Package className="h-6 w-6 text-pizzabi-red" />,
      title: "Size Strategy",
      value: "Large (36.7%)",
      description: "Large pizzas contribute the most to sales revenue.",
      color: "bg-red-500/15",
    },
    {
      icon: <Zap className="h-6 w-6 text-pizzabi-green" />,
      title: "Launch Comparison",
      value: "BBQ Chicken",
      description: "New BBQ Chicken pizza outsold last month by 18%.",
      color: "bg-green-500/15",
    },
  ]

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-bold mb-1" style={{ color: "#f5a623" }}>
          Key Insights
        </h3>
        <p className="text-sm" style={{ color: "#6b7280" }}>
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
