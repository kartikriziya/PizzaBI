import { useState } from "react"

// ── tokens ────────────────────────────────────────────────────────────────────
const C = {
  bg: "#13151f",
  border: "#252840",
  orange: "#f5a623",
  red: "#e84040",
  muted: "#6b7280",
  text: "#e5e7eb",
}

// ── tiny inline SVG icon ──────────────────────────────────────────────────────
function Icon({ d, size = 16, color = "currentColor" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  )
}

// ── single nav item ───────────────────────────────────────────────────────────
function NavItem({ icon, label, active, collapsed, onClick }) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      className="group flex w-full min-w-0 items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-sm transition-all duration-150"
      style={
        active
          ? {
              background: `linear-gradient(90deg,${C.orange}1a,${C.red}0d)`,
              color: C.orange,
            }
          : { color: C.muted }
      }
    >
      <span className="flex-shrink-0 transition-transform duration-150 group-hover:scale-110">
        <Icon d={icon} size={16} color={active ? C.orange : C.muted} />
      </span>

      {!collapsed && (
        <span
          className="truncate font-medium transition-opacity duration-150"
          style={{ opacity: active ? 1 : 0.7 }}
        >
          {label}
        </span>
      )}

      {active && !collapsed && (
        <span
          className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: C.orange }}
        />
      )}
    </button>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
/**
 * Props
 * ─────
 * collapsed  : boolean         – controlled collapse state
 * onCollapse : (bool) => void  – toggle callback
 * activeNav  : string          – currently active nav key
 * onNavChange: (key) => void   – nav selection callback
 */
export default function SampleSidebar({
  collapsed = false,
  onCollapse,
  activeNav = "overview",
  onNavChange,
}) {
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const isCollapsed = onCollapse ? collapsed : internalCollapsed

  const toggleCollapse = () => {
    if (onCollapse) onCollapse(!collapsed)
    else setInternalCollapsed((v) => !v)
  }

  const NAV = [
    {
      key: "overview",
      label: "Overview",
      icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
    },
  ]

  return (
    <aside
      className="flex flex-col flex-shrink-0 overflow-x-hidden transition-all duration-300"
      style={{
        width: isCollapsed ? 64 : 208,
        background: C.bg,
        borderRight: `1px solid ${C.border}`,
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      <div
        className="flex min-w-0 flex-shrink-0 items-center gap-2.5 px-4 py-5"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <div
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-base"
          style={{
            background: `linear-gradient(135deg, ${C.orange}, ${C.red})`,
          }}
        >
          🍕
        </div>

        {!isCollapsed && (
          <div className="min-w-0 overflow-hidden">
            <div className="whitespace-nowrap text-sm font-bold leading-none">
              <span style={{ color: "#fff" }}>Pizza</span>
              <span style={{ color: C.orange }}>BI</span>
            </div>
            <div
              className="mt-0.5 truncate text-[10px]"
              style={{ color: C.muted }}
            >
              Analytics Dashboard
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {NAV.map((n) => (
          <NavItem
            key={n.key}
            icon={n.icon}
            label={n.label}
            active={activeNav === n.key}
            collapsed={isCollapsed}
            onClick={() => onNavChange?.(n.key)}
          />
        ))}
      </nav>

      {!isCollapsed && (
        <div
          className="mx-3 mb-3 min-w-0 rounded-xl p-3 overflow-hidden"
          style={{ background: "#1e2235", border: `1px solid ${C.orange}33` }}
        >
          <div
            className="flex items-center gap-1.5 text-xs font-semibold"
            style={{ color: C.orange }}
          >
            ⭐ Pro Plan
          </div>
          <div className="mt-1 text-[10px] truncate" style={{ color: C.muted }}>
            Renews Jun 30, 2024
          </div>
          <button
            className="mt-2 w-full rounded-lg px-2 py-1 text-[10px] hover:opacity-80 transition-opacity"
            style={{
              background: `${C.orange}22`,
              color: C.orange,
              border: `1px solid ${C.orange}44`,
            }}
          >
            Manage Plan
          </button>
        </div>
      )}

      <div className="px-3 pb-4">
        <button
          onClick={toggleCollapse}
          className="flex w-full items-center justify-center rounded-xl py-2 hover:opacity-80 transition-opacity"
          style={{ background: "#1e2235", color: C.muted }}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Icon
            d={isCollapsed ? "M9 18l6-6-6-6" : "M15 18l-6-6 6-6"}
            size={14}
            color={C.muted}
          />
        </button>
      </div>
    </aside>
  )
}