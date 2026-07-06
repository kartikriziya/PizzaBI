import { useEffect, useState } from "react"
import {
  getCategoryChartData,
  getRadarChartData,
  getSizeChartData,
} from "../apis/chartApi"
import { getKpiMetrics } from "../apis/kpiApi"
import ChartArea from "./ChartArea"
import KeyInsights from "./KeyInsights"
import RecommendationsTable from "./RecommendationsTable"

/**
 * OverviewContent
 * ───────────────
 * Displays Key Insights as KPI cards and Recommendations as table.
 * With toggle between the two views.
 */
export default function OverviewContent({ selectedFilters = {} }) {
  const [overviewData, setOverviewData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let isMounted = true

    const loadOverviewData = async () => {
      try {
        setLoading(true)
        const [kpiMetrics, categoryData, sizeData, radarData] =
          await Promise.all([
            getKpiMetrics(selectedFilters),
            getCategoryChartData(selectedFilters),
            getSizeChartData(selectedFilters),
            getRadarChartData(selectedFilters),
          ])

        if (isMounted) {
          setOverviewData({ kpiMetrics, categoryData, sizeData, radarData })
          setError("")
        }
      } catch (err) {
        console.error(err)
        if (isMounted) {
          setError("Unable to load overview insights.")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadOverviewData()

    return () => {
      isMounted = false
    }
  }, [selectedFilters])

  return (
    <>
      {/* Header Section */}
      <div className="space-y-4 mb-6">
        <h1 className="text-2xl font-bold text-pizzabi-gold">Overview</h1>
        <p className="text-pizzabi-muted text-sm">
          Key insights and strategic recommendations for optimizing your pizza
          business performance.
        </p>
      </div>

      {error && <p className="mb-4 text-sm text-pizzabi-red">{error}</p>}

      {/* Content Sections */}
      <section className="mb-6">
        <div className="w-full bg-pizzabi-card border border-pizzabi-muted/10 rounded-2xl p-4 md:p-6">
          <KeyInsights
            overviewData={overviewData}
            loading={loading}
            error={error}
          />
        </div>
      </section>

      <section className="mb-6">
        <div className="w-full bg-pizzabi-card border border-pizzabi-muted/10 rounded-2xl p-4 md:p-6">
          <ChartArea selectedFilters={selectedFilters} />
        </div>
      </section>

      <section className="mb-6">
        <div className="w-full bg-pizzabi-card border border-pizzabi-muted/10 rounded-2xl p-4 md:p-6">
          <RecommendationsTable
            overviewData={overviewData}
            loading={loading}
            error={error}
          />
        </div>
      </section>
    </>
  )
}
