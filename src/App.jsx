import React, { useState } from "react"
import AppRouter from "./routes/AppRouter"
import Login from "./pages/Login"

export default function App() {
  // Global theme state managed at the root level
  const [isDarkMode, setIsDarkMode] = useState(true)

  // Auth state read directly from local browser storage on mount
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("pizza_bi_auth") === "true"
  })

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev)
  }

  // Handle successful login confirmation
  const handleLogin = () => {
    localStorage.setItem("pizza_bi_auth", "true")
    setIsAuthenticated(true)
  }

  // Handle application session tear-downs
  const handleLogout = () => {
    localStorage.removeItem("pizza_bi_auth")
    setIsAuthenticated(false)
    setIsDarkMode(true)
  }

  return (
    <div
      className={`h-screen w-screen overflow-hidden ${isDarkMode ? "" : "light"}`}
    >
      {isAuthenticated ? (
        <AppRouter
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onLogout={handleLogout}
        />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  )
}
