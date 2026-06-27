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
    <div className="rounded-2xl border border-pizzabi-muted/20 bg-white/5 p-4 shadow-sm hover:border-pizzabi-muted/40 transition-all">
      <div className="flex items-start gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-full flex-shrink-0 ${color}`}>
          {icon}
        </div>

        <div className="flex-1">
          <p className="text-sm text-pizzabi-muted font-medium">{title}</p>
          <h3 className="text-lg font-semibold text-white mt-1">{value}</h3>
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
      color: "bg-pizzabi-gold/20",
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-pizzabi-amber" />,
      title: "Best Performance",
      value: "Pepperoni",
      description: "Pepperoni generated the highest revenue at $1,429K.",
      color: "bg-pizzabi-amber/20",
    },
    {
      icon: <MapPin className="h-6 w-6 text-pizzabi-teal" />,
      title: "Regional Favorite",
      value: "BBQ Chicken",
      description: "BBQ Chicken performs best at Downtown and City Center stores.",
      color: "bg-pizzabi-teal/20",
    },
    {
      icon: <Package className="h-6 w-6 text-pizzabi-red" />,
      title: "Size Strategy",
      value: "Large (36.7%)",
      description: "Large pizzas contribute the most to sales revenue.",
      color: "bg-pizzabi-red/20",
    },
    {
      icon: <Zap className="h-6 w-6 text-pizzabi-green" />,
      title: "Launch Comparison",
      value: "BBQ Chicken",
      description: "New BBQ Chicken pizza outsold last month by 18%.",
      color: "bg-pizzabi-green/20",
    },
  ]

  return (
    <div className="mb-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-pizzabi-gold">Insights</h2>
        <p className="text-sm text-pizzabi-muted mt-1">
          Key performance metrics and business intelligence
        </p>
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
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
