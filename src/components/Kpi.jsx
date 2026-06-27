import React from "react"
import { DollarSign, ShoppingBag, Pizza, BadgeDollarSign, Users } from "lucide-react"

function Card({ bg, icon, label, value, delta }) {
  return (
    <div className="rounded-2xl border border-pizzabi-muted/20 bg-white/5 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${bg}`}>
          {icon}
        </div>

        <div>
          <p className="text-sm text-pizzabi-muted">{label}</p>
          <h3 className="text-2xl font-semibold text-white">{value}</h3>
          {delta && (
            <p className="mt-1 text-sm text-green-500">{delta}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Kpi() {
  return (
    <div className="mb-4">
      <div className="grid gap-4 p-0 grid-cols-1 md:grid-cols-2 xl:grid-cols-5">
        <Card
          bg="bg-red-50"
          icon={<DollarSign className="h-6 w-6 text-red-500" />}
          label="Total Revenue"
          value="$1,248,250"
          delta="▲ 12.6% vs Apr 1 - Apr 30"
        />

        <Card
          bg="bg-green-50"
          icon={<ShoppingBag className="h-6 w-6 text-green-600" />}
          label="Total Orders"
          value="18,732"
          delta="▲ 8.3% vs Apr 1 - Apr 30"
        />

        <Card
          bg="bg-yellow-50"
          icon={<Pizza className="h-6 w-6 text-yellow-600" />}
          label="Pizzas Sold"
          value="28,451"
          delta="▲ 10.7% vs Apr 1 - Apr 30"
        />

        <Card
          bg="bg-blue-50"
          icon={<BadgeDollarSign className="h-6 w-6 text-blue-600" />}
          label="Avg. Order Value"
          value="$66.61"
          delta="▲ 4.0% vs Apr 1 - Apr 30"
        />

        <Card
          bg="bg-purple-50"
          icon={<Users className="h-6 w-6 text-purple-600" />}
          label="New Customers"
          value="2,745"
          delta="▲ 6.9% vs Apr 1 - Apr 30"
        />
      </div>
    </div>
  )
}
