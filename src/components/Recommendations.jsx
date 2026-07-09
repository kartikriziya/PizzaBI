import React from "react"
import { Utensils, Award, Crown, Target, Lightbulb } from "lucide-react"

function RecommendationCard({ icon, title, recommendation, reason, color }) {
  return (
    <div className="rounded-2xl border border-pizzabi-muted/20 bg-white/5 p-4 shadow-sm hover:border-pizzabi-muted/40 transition-all">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full shrink-0 ${color}`}
        >
          {icon}
        </div>

        <div className="flex-1">
          <p className="text-sm text-pizzabi-muted font-medium">{title}</p>
          <h3 className="text-lg font-semibold text-white mt-1">
            {recommendation}
          </h3>
          <p className="text-xs text-pizzabi-muted/70 mt-2">{reason}</p>
        </div>
      </div>
    </div>
  )
}

export default function Recommendations() {
  const recommendations = [
    {
      icon: <Utensils className="h-6 w-6 text-pizzabi-gold" />,
      title: "Top Menu Item",
      recommendation: "Margherita Pizza",
      reason:
        "Feature as best seller - highly profitable and customer favorite.",
      color: "bg-pizzabi-gold/20",
    },
    {
      icon: <Award className="h-6 w-6 text-pizzabi-amber" />,
      title: "Premium Recommendation",
      recommendation: "Pepperoni Pizza",
      reason: "Highest revenue generator - optimize pricing and promote.",
      color: "bg-pizzabi-amber/20",
    },
    {
      icon: <Crown className="h-6 w-6 text-pizzabi-teal" />,
      title: "Regional Strategy",
      recommendation: "BBQ Chicken Focus",
      reason:
        "Dominant in key markets - expand availability in Downtown & City Center.",
      color: "bg-pizzabi-teal/20",
    },
    {
      icon: <Target className="h-6 w-6 text-pizzabi-red" />,
      title: "Bundle Strategy",
      recommendation: "Large Size Combos",
      reason:
        "Largest profit contributor - create combo deals for large pizzas.",
      color: "bg-pizzabi-red/20",
    },
    {
      icon: <Lightbulb className="h-6 w-6 text-pizzabi-green" />,
      title: "New Launch Push",
      recommendation: "BBQ Chicken Special",
      reason: "New launch performing well - increase promotional activities.",
      color: "bg-pizzabi-green/20",
    },
  ]

  return (
    <div className="mb-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-pizzabi-gold">Recommendations</h2>
        <p className="text-sm text-pizzabi-muted mt-1">
          Strategic recommendations based on key insights and performance data
        </p>
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
        {recommendations.map((rec, idx) => (
          <RecommendationCard
            key={idx}
            icon={rec.icon}
            title={rec.title}
            recommendation={rec.recommendation}
            reason={rec.reason}
            color={rec.color}
          />
        ))}
      </div>
    </div>
  )
}
