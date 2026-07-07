import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useRef,
} from "react"
import { NavLink } from "react-router-dom"
import PizzaBI_Logo from "../assets/pizza_bi_logo.png"
import PizzaBI_LabelDark from "../assets/pizza_bi_label_dark.png"
import PizzaBI_LabelLight from "../assets/pizza_bi_label_light.png"
import {
  Sun,
  Moon,
  MoreVertical,
  ChevronFirst,
  ChevronLast,
  LogOut,
  Settings,
} from "lucide-react"

const SidebarContext = createContext()
/**
 * Main Sidebar Layout Component with integrated Light/Dark Mode Root State
 */
export default function Sidebar({
  children,
  isDarkMode,
  toggleTheme,
  onLogout,
}) {
  const [expanded, setExpanded] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    setMenuOpen(false)
  }, [expanded])

  useEffect(() => {
    const handleClickAway = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickAway)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickAway)
    }
  }, [menuOpen])

  return (
    /* THE ROOT WRAPPER: 
      This injects the '.light' class dynamically right at the root wrapper container.
      Tailwind v4 will automatically recalculate all internal variables mapped within the @theme block.
    */
    <div>
      <aside
        className={`h-screen overflow-hidden transition-all duration-200 ${expanded ? "w-64" : "w-20"}`}
      >
        <nav className="bg-pizzabi-main h-full flex flex-col border-r border-gray-800/20 shadow-sm transition-colors duration-200">
          {/* Top Header Section */}
          <div
            className={`p-4 pb-2 flex items-center ${expanded ? "justify-between" : "justify-center"}`}
          >
            {/* Swaps brand labels based on current active theme view context */}
            <img
              src={isDarkMode ? PizzaBI_LabelLight : PizzaBI_LabelDark}
              alt="PizzaBI Logo"
              className={`object-contain overflow-hidden transition-all ${expanded ? "w-32" : "w-0"}`}
            />

            {/* Button Action Group Wrapper */}
            <div className="flex items-center">
              {/* Your Original Sidebar Collapse Button */}
              <button
                className="p-2 rounded-lg bg-pizzabi-gold hover:opacity-90 transition-all cursor-pointer shadow-sm flex items-center justify-center"
                aria-label="Toggle Sidebar"
                onClick={() => setExpanded((prev) => !prev)}
              >
                {expanded ? (
                  <ChevronFirst className="text-pizzabi-main w-4 h-4 stroke-[2.5]" />
                ) : (
                  <ChevronLast className="text-pizzabi-main w-4 h-4 stroke-[2.5]" />
                )}
              </button>
            </div>
          </div>

          {/* Navigation Items List Slot Container */}
          <SidebarContext.Provider value={{ expanded }}>
            <ul className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto overflow-x-hidden">
              <li className="rounded-md bg-pizzabi-card/20 p-2 mb-2">
                <button
                  onClick={toggleTheme}
                  className="w-full rounded-md bg-pizzabi-gold hover:opacity-90 transition-all cursor-pointer shadow-sm flex items-center justify-center py-2"
                  title={
                    isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
                  }
                >
                  {isDarkMode ? (
                    <Sun className="text-pizzabi-main w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <Moon className="text-pizzabi-main w-4 h-4 stroke-[2.5]" />
                  )}
                </button>
              </li>
              {children}
            </ul>
          </SidebarContext.Provider>

          {/* User Profile Card Footer */}
          <div className="border-t border-pizzabi-muted/20 flex items-center p-4 bg-pizzabi-card/10 relative">
            <img
              src={PizzaBI_Logo}
              alt="User Avatar"
              className="w-10 h-10 rounded-md object-cover shadow-sm"
            />

            <div className="flex justify-between items-center flex-1 ml-3 min-w-0">
              <div className="truncate">
                <h4 className="font-semibold text-sm text-pizzabi-gold truncate">
                  Admin
                </h4>
                <p className="text-xs text-pizzabi-muted truncate">
                  admin.sabba@fra-uas.de
                </p>
              </div>
              <div className="relative" ref={menuRef}>
                {expanded && (
                  <>
                    <button
                      onClick={() => setMenuOpen(!menuOpen)}
                      className="p-1 text-pizzabi-gold hover:bg-pizzabi-card/40 rounded transition-colors ml-1 cursor-pointer"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {menuOpen && (
                      <div className="absolute bottom-full right-0 mb-2 w-48 bg-pizzabi-card border border-pizzabi-muted/30 rounded-lg shadow-lg py-1 z-50">
                        <button
                          onClick={() => {
                            onLogout && onLogout()
                            setMenuOpen(false)
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-pizzabi-muted hover:bg-pizzabi-card/60 hover:text-pizzabi-gold transition-colors text-sm"
                        >
                          <LogOut size={16} />
                          <span>Logout</span>
                        </button>
                        <button
                          onClick={() => {
                            window.open(
                              "https://app.notion.com/p/396649f4548d805984bac3d1573f2f28?v=396649f4548d805895a3000c4d9013bf&source=copy_link",
                              "_blank",
                              "noopener,noreferrer"
                            )
                            setMenuOpen(false)
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-pizzabi-muted hover:bg-pizzabi-card/60 hover:text-pizzabi-gold transition-colors text-sm"
                        >
                          <Settings size={16} />
                          <span>Project plan</span>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>
      </aside>
    </div>
  )
}

/**
 * Individual Sidebar Navigation Link Item Component
 */
export function SidebarItem({ icon, text, to = "/", active = false }) {
  const { expanded } = useContext(SidebarContext)
  const [tooltipPos, setTooltipPos] = useState(null)
  const itemRef = useRef(null)

  const handleMouseEnter = () => {
    if (!expanded && itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect()
      setTooltipPos({
        top: rect.top + rect.height / 2,
        left: rect.right + 8,
      })
    }
  }

  const handleMouseLeave = () => setTooltipPos(null)

  return (
    <li
      ref={itemRef}
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <NavLink
        end={to === "/"}
        to={to}
        className={({ isActive }) => {
          const isSelected = active || isActive
          return `flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-150 text-sm font-medium ${
            isSelected
              ? "bg-pizzabi-card text-pizzabi-gold shadow-xs"
              : "text-pizzabi-muted hover:bg-pizzabi-card/40 hover:text-pizzabi-gold"
          }`
        }}
      >
        <span className="shrink-0">{icon}</span>
        {expanded && <span className="truncate">{text}</span>}
      </NavLink>

      {tooltipPos && (
        <div
          style={{ top: tooltipPos.top, left: tooltipPos.left }}
          className="fixed z-9999 -translate-y-1/2 rounded-md px-2 py-1 bg-pizzabi-card shadow-lg text-xs text-pizzabi-gold whitespace-nowrap pointer-events-none"
        >
          {text}
        </div>
      )}
    </li>
  )
}
