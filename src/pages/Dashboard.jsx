import Charts from "../components/Charts"
import ChartCoMatrix from "../components/ChartCoMatrix"

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-pizzabi-main">
      <main className="px-4 md:px-6 lg:px-8 py-6">
        <div className="mx-auto max-w-7xl space-y-6">

          <div>
            <h1 className="text-2xl font-bold text-pizzabi-gold">Main Dashboard</h1>
            <p className="text-pizzabi-muted text-sm mt-1">
              Welcome back! Your core real-time analytics monitoring cards and
              sales data views will mount inside this frame.
            </p>
          </div>

          {/* Sales charts */}
          <section className="bg-pizzabi-card border border-pizzabi-muted/10 rounded-3xl p-4 md:p-6">
            <Charts />
          </section>

          {/* Pizza co-occurrence matrix */}
          <section className="bg-pizzabi-card border border-pizzabi-muted/10 rounded-3xl p-4 md:p-6">
            <ChartCoMatrix />
          </section>

        </div>
      </main>
    </div>
  )
}
