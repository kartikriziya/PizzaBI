import { BrowserRouter, Routes, Route } from "react-router-dom"
import MainLayout from "../layouts/MainLayout" // Renamed layout component
import Dashboard from "../pages/Dashboard" // Your new empty default page
import OverviewDashboard from "../pages/OverviewDashboard"
import SampleDashboard from "../pages/SampleDashboard"
import UploadFile from "../components/UploadFile"

export default function AppRouter({ isDarkMode, toggleTheme, onLogout }) {
  return (
    <BrowserRouter>
      <Routes>
        {/* Parent Layout Route: This renders the persistent shell layout (Sidebar).
          We pass the theme and logout props down to the MainLayout shell.
        */}
        <Route
          element={
            <MainLayout
              isDarkMode={isDarkMode}
              toggleTheme={toggleTheme}
              onLogout={onLogout}
            />
          }
        >
          {/* Nested Child Routes: These get dropped dynamically into the 
            <Outlet /> placeholder inside MainLayout based on the URL path.
          */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/overview" element={<OverviewDashboard />} />
          <Route path="/upload" element={<UploadFile />} />
          <Route path="/statistics" element={<SampleDashboard />} />
          <Route path="/sample-dashboard" element={<SampleDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
