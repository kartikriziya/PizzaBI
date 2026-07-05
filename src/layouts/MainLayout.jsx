import React from "react"
import { Outlet, useLocation } from "react-router-dom"
import Sidebar, { SidebarItem } from "../components/Sidebar"
import { BarChart3, LayoutDashboard, Upload, Eye } from "lucide-react"
import PizzaSalesHeader from "../components/Header"

// Routes where the filter bar should NOT appear
const NO_HEADER_ROUTES = ["/upload"]

export default function MainLayout({ isDarkMode, toggleTheme, onLogout }) {
  const { pathname } = useLocation()
  const showHeader = !NO_HEADER_ROUTES.includes(pathname)

  return (
    <div
      className="flex h-screen w-screen overflow-hidden bg-pizzabi-main transition-colors duration-200"
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
    >
      {/* Persistent App Sidebar */}
      <Sidebar
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        onLogout={onLogout}
      >
        <SidebarItem
          icon={<LayoutDashboard size={20} />}
          text="Dashboard"
          to="/"
        />
        <SidebarItem
          icon={<BarChart3 size={20} />}
          text="Statistics"
          to="/statistics"
        />
        <SidebarItem icon={<Eye size={20} />} text="Overview" to="/overview" />
        <SidebarItem
          icon={<Upload size={20} />}
          text="Upload File"
          to="/upload"
        />
      </Sidebar>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Shared filter bar — shown on Dashboard & Statistics, hidden on Upload */}
        {showHeader && <PizzaSalesHeader />}

        {/* Page content */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
