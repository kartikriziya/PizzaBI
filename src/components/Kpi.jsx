import React, { useEffect, useMemo, useState } from "react"
import {
  DollarSign,
  ShoppingBag,
  Pizza,
  BadgeDollarSign,
  Users,
} from "lucide-react"
import { getKpiMetrics } from "../apis/kpiApi.js"

function Card({ bg, icon, label, value, delta }) {
  return (
    <div className="rounded-2xl border border-pizzabi-muted/20 bg-white/5 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full ${bg}`}
        >
          {icon}
        </div>

        <div>
          <p className="text-sm text-pizzabi-muted">{label}</p>
          <h3 className="text-2xl font-semibold text-white">{value}</h3>
          {delta && <p className="mt-1 text-sm text-green-500">{delta}</p>}
        </div>
      </div>
    </div>
  )
}

export default function Kpi({ selectedFilters = {} }) {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true)
        const data = await getKpiMetrics(selectedFilters)
        setMetrics(data)
        setError("")
      } catch (err) {
        console.error(err)
        setError("Unable to load KPI metrics.")
      } finally {
        setLoading(false)
      }
    }

    loadMetrics()
  }, [selectedFilters])

  const cards = useMemo(() => {
    if (!metrics) {
      return []
    }

    return [
      {
        bg: "bg-red-50",
        icon: <DollarSign className="h-6 w-6 text-red-500" />,
        label: "Total Revenue",
        value: `$${Number(metrics.totalRevenue?.value || 0).toLocaleString()}`,
        delta: metrics.totalRevenue?.delta,
      },
      {
        bg: "bg-green-50",
        icon: <ShoppingBag className="h-6 w-6 text-green-600" />,
        label: "Total Orders",
        value: Number(metrics.totalOrders?.value || 0).toLocaleString(),
        delta: metrics.totalOrders?.delta,
      },
      {
        bg: "bg-yellow-50",
        icon: <Pizza className="h-6 w-6 text-yellow-600" />,
        label: "Pizzas Sold",
        value: Number(metrics.pizzasSold?.value || 0).toLocaleString(),
        delta: metrics.pizzasSold?.delta,
      },
      {
        bg: "bg-blue-50",
        icon: <BadgeDollarSign className="h-6 w-6 text-blue-600" />,
        label: "Avg. Order Value",
        value: `$${Number(metrics.averageOrderValue?.value || 0).toFixed(2)}`,
        delta: metrics.averageOrderValue?.delta,
      },
      {
        bg: "bg-purple-50",
        icon: <Users className="h-6 w-6 text-purple-600" />,
        label: "New Customers",
        value: Number(metrics.newCustomers?.value || 0).toLocaleString(),
        delta: metrics.newCustomers?.delta,
      },
    ]
  }, [metrics])

  return (
    <div className="mb-4">
      {error && <p className="mb-3 text-sm text-pizzabi-red">{error}</p>}
      <div className="grid gap-4 p-0 grid-cols-1 md:grid-cols-2 xl:grid-cols-5">
        {loading && !metrics
          ? Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-2xl border border-pizzabi-muted/20 bg-white/5 p-4 shadow-sm"
              >
                <div className="h-12 w-12 rounded-full bg-white/10" />
                <div className="mt-3 h-3 w-24 rounded bg-white/10" />
                <div className="mt-2 h-6 w-24 rounded bg-white/10" />
              </div>
            ))
          : cards.map((card) => <Card key={card.label} {...card} />)}
      </div>
    </div>
  )
}
