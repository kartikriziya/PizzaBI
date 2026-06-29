import { BrowserRouter, Routes, Route } from "react-router-dom"
import MainLayout from "../layouts/MainLayout"
import Dashboard from "../pages/Dashboard"
import SampleDashboard from "../pages/SampleDashboard"
import UploadFile from "../components/UploadFile"
import PizzaBIDashboard from "../pages/PizzaBIDashboard"

export default function AppRouter({ isDarkMode, toggleTheme, onLogout }) {
  return (
    <BrowserRouter>
      <Routes>
        {/* PizzaBIDashboard ist die Hauptseite */}
        <Route path="/" element={<PizzaBIDashboard />} />
        <Route path="/pizza-bi" element={<PizzaBIDashboard />} />

        <Route
          element={
            <MainLayout
              isDarkMode={isDarkMode}
              toggleTheme={toggleTheme}
              onLogout={onLogout}
            />
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<UploadFile />} />
          <Route path="/statistics" element={<SampleDashboard />} />
          <Route path="/sample-dashboard" element={<SampleDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
