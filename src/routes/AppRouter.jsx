import { useEffect, useRef, useState } from "react"
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import MainLayout from "../layouts/MainLayout"
import Dashboard from "../pages/Dashboard"
import StatisticDashboard from "../pages/StatisticDashboad"
import OverviewDashboard from "../pages/OverviewDashboard"
import UploadFile from "../components/UploadFile"

const DEFAULT_FILTERS = {
  startDate: "",
  endDate: "",
  city: "",
  state: "",
  category: "",
  size: "",
}

const HEADER_ROUTES = new Set(["/", "/overview", "/statistics"])

function AppRouterContent({ isDarkMode, toggleTheme, onLogout }) {
  const location = useLocation()
  const previousPathRef = useRef(location.pathname)
  const [selectedFilters, setSelectedFilters] = useState(DEFAULT_FILTERS)

  useEffect(() => {
    const previousPath = previousPathRef.current
    const currentHasHeader = HEADER_ROUTES.has(location.pathname)
    const previousHasHeader = HEADER_ROUTES.has(previousPath)

    if (currentHasHeader !== previousHasHeader) {
      setSelectedFilters(DEFAULT_FILTERS)
    }

    previousPathRef.current = location.pathname
  }, [location.pathname])

  return (
    <Routes>
      <Route
        element={
          <MainLayout
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
            onLogout={onLogout}
          />
        }
      >
        <Route
          path="/"
          element={
            <Dashboard
              selectedFilters={selectedFilters}
              onFiltersChange={setSelectedFilters}
            />
          }
        />
        <Route
          path="/overview"
          element={
            <OverviewDashboard
              selectedFilters={selectedFilters}
              onFiltersChange={setSelectedFilters}
            />
          }
        />
        <Route
          path="/statistics"
          element={
            <StatisticDashboard
              selectedFilters={selectedFilters}
              onFiltersChange={setSelectedFilters}
            />
          }
        />
        <Route path="/upload" element={<UploadFile />} />
      </Route>
    </Routes>
  )
}

export default function AppRouter(props) {
  return (
    <BrowserRouter>
      <AppRouterContent {...props} />
    </BrowserRouter>
  )
}
