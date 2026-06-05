import React, { useState } from "react"
import PizzaBI_LabelLight from "../assets/pizza_bi_label_light.png"

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()

    // Hardcoded credentials match condition parameters
    if (username === "admin" && password === "admin") {
      setError("")
      onLogin()
    } else {
      setError("Invalid administrative credentials. Please try again.")
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-pizzabi-main p-4 md:p-8 transition-colors duration-200">
      <div className="w-full max-w-md bg-pizzabi-card border border-pizzabi-muted/10 rounded-2xl p-6 md:p-8 shadow-xl transition-colors duration-200">
        {/* Branding Logo Header */}
        <div className="flex flex-col items-center mb-8">
          <img
            src={PizzaBI_LabelLight}
            alt="PizzaBI Logo"
            className="w-44 object-contain mb-2"
          />
          <p className="text-pizzabi-muted text-xs text-center">
            Turning Pizza Data into Delicious Insights
          </p>
        </div>

        {/* Error Alert Display Box */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-pizzabi-red/10 border border-pizzabi-red/30 text-pizzabi-red text-xs font-medium">
            {error}
          </div>
        )}

        {/* Credentials Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-pizzabi-muted mb-1.5 uppercase tracking-wider">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter admin"
              className="w-full px-4 py-2.5 rounded-lg bg-pizzabi-main border border-pizzabi-muted/20 text-sm text-white focus:outline-none focus:border-pizzabi-gold/60 transition-colors placeholder:text-pizzabi-muted/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-pizzabi-muted mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg bg-pizzabi-main border border-pizzabi-muted/20 text-sm text-white focus:outline-none focus:border-pizzabi-gold/60 transition-colors placeholder:text-pizzabi-muted/40"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-lg bg-pizzabi-gold text-pizzabi-main text-sm font-semibold hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer shadow-md"
            >
              Sign In to Dashboard
            </button>
          </div>
        </form>

        {/* Context Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-[10px] text-pizzabi-muted/50">
            Internal Corporate Administration Console Only
          </p>
        </div>
      </div>
    </div>
  )
}
