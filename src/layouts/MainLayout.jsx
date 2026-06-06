import React from "react"
import { Outlet } from "react-router-dom"
import Sidebar, { SidebarItem } from "../components/Sidebar"
import { BarChart3, LayoutDashboard, Upload } from "lucide-react"

export default function MainLayout({ isDarkMode, toggleTheme, onLogout }) {
  return (
    <div
      className="flex h-screen w-screen overflow-hidden bg-pizzabi-main transition-colors duration-200"
      style={{
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
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
        <SidebarItem
          icon={<Upload size={5} />}
          text="Upload File"
          to="/upload"
        />
      </Sidebar>

      {/* Main Right Side Content Window Panel Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* ── THE OUTLET HOLE ────────────────────────────────────────────── */}
        {/* Dynamic child components (Dashboard, SampleDashboard, etc.) 
            will mount automatically right here when routes are clicked! 
        */}
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
