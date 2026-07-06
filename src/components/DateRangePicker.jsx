import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getAllTimeRange } from "../apis/filterApi.js"

// ── pure date helpers (no external deps) ──────────────────────────────────────

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function isSameDay(a, b) {
  if (!a || !b) return false
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function isInRange(d, start, end) {
  if (!start || !end) return false
  return d > start && d < end
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

// Monday-based: Mo=0 … So=6
function firstWeekdayOfMonth(year, month) {
  return (new Date(year, month, 1).getDay() + 6) % 7
}

export function formatRangeValue(range) {
  if (!range?.start || !range?.end) return "Auswählen…"
  const startYear = range.start.getFullYear()
  const endYear = range.end.getFullYear()
  const fmtStart = (d, includeYear) =>
    d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      ...(includeYear ? { year: "numeric" } : {}),
    })
  const startStr = fmtStart(range.start, startYear !== endYear)
  const endStr = range.end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
  return `${startStr} – ${endStr}`
}

function formatDE(d) {
  if (!d) return "—"
  return d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

// ── Quick-Select presets ───────────────────────────────────────────────────────

const today = startOfDay(new Date())

function sub(days) {
  return new Date(today.getFullYear(), today.getMonth(), today.getDate() - days)
}
function qStart(y, q) {
  return new Date(y, (q - 1) * 3, 1)
}
function qEnd(y, q) {
  return new Date(y, q * 3, 0)
}

function buildPresets(year, fullRange) {
  const currentYear = Number.isFinite(year) ? year : today.getFullYear()

  return [
    { label: "Letzte 7 Tage", getRange: () => [sub(6), today] },
    { label: "Letzte 30 Tage", getRange: () => [sub(29), today] },
    {
      label: "Letzter Monat",
      getRange: () => [
        new Date(today.getFullYear(), today.getMonth() - 1, 1),
        new Date(today.getFullYear(), today.getMonth(), 0),
      ],
    },
    { type: "divider" },
    {
      label: `Q1 ${currentYear}`,
      getRange: () => [qStart(currentYear, 1), qEnd(currentYear, 1)],
    },
    {
      label: `Q2 ${currentYear}`,
      getRange: () => [qStart(currentYear, 2), qEnd(currentYear, 2)],
    },
    {
      label: `Q3 ${currentYear}`,
      getRange: () => [qStart(currentYear, 3), qEnd(currentYear, 3)],
    },
    {
      label: `Q4 ${currentYear}`,
      getRange: () => [qStart(currentYear, 4), qEnd(currentYear, 4)],
    },
    { type: "divider" },
    {
      label: `Jahr ${currentYear}`,
      getRange: () => [
        new Date(currentYear, 0, 1),
        new Date(currentYear, 11, 31),
      ],
    },
    {
      label: `Jahr ${currentYear - 1}`,
      getRange: () => [
        new Date(currentYear - 1, 0, 1),
        new Date(currentYear - 1, 11, 31),
      ],
    },
    { type: "divider" },
    {
      label: "All Time Range",
      getRange: () => {
        if (fullRange?.startDate && fullRange?.endDate) {
          return [new Date(fullRange.startDate), new Date(fullRange.endDate)]
        }
        return [new Date(currentYear, 0, 1), new Date(currentYear, 11, 31)]
      },
    },
  ]
}

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]
const MONTHS_DE = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
]

// ── CalendarMonth ─────────────────────────────────────────────────────────────

function CalendarMonth({
  year,
  month,
  start,
  end,
  hover,
  onDayClick,
  onDayHover,
}) {
  const blanks = firstWeekdayOfMonth(year, month)
  const total = getDaysInMonth(year, month)
  const rangeEnd = end || hover

  return (
    <div className="flex-1 min-w-0">
      <p className="text-center text-sm font-semibold text-pizzabi-foreground mb-3">
        {MONTHS_DE[month]} {year}
      </p>

      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[11px] text-pizzabi-muted font-medium py-1"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5">
        {Array.from({ length: blanks }).map((_, i) => (
          <div key={`b${i}`} />
        ))}
        {Array.from({ length: total }, (_, i) => {
          const date = new Date(year, month, i + 1)
          const isStart = isSameDay(date, start)
          const isEnd = isSameDay(date, end)
          const inRange = isInRange(date, start, rangeEnd)
          const isToday = isSameDay(date, today)

          let cls =
            "h-8 flex items-center justify-center text-xs rounded-md cursor-pointer select-none transition-colors "

          if (isStart || isEnd) {
            cls += "bg-pizzabi-gold text-pizzabi-main font-bold"
          } else if (inRange) {
            cls += "bg-pizzabi-gold/20 text-pizzabi-foreground"
          } else if (isToday) {
            cls +=
              "border border-pizzabi-gold/50 text-pizzabi-gold hover:bg-pizzabi-card/60"
          } else {
            cls +=
              "text-pizzabi-muted hover:bg-pizzabi-card hover:text-pizzabi-foreground"
          }

          return (
            <div
              key={i}
              className={cls}
              onClick={() => onDayClick(date)}
              onMouseEnter={() => onDayHover(date)}
            >
              {i + 1}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── DateRangePicker ───────────────────────────────────────────────────────────
//
// Uses position:fixed so it is never clipped by overflow:auto/hidden parents.
// `anchor`  — { top, left } from the chip button's getBoundingClientRect()
// `chipRef` — ref to the chip button (excluded from the outside-click check)

export default function DateRangePicker({
  initialStart,
  initialEnd,
  initialPreset,
  onApply,
  onCancel,
  anchor,
  chipRef,
}) {
  const [start, setStart] = useState(
    initialStart ? startOfDay(initialStart) : null,
  )
  const [end, setEnd] = useState(initialEnd ? startOfDay(initialEnd) : null)
  const [hover, setHover] = useState(null)
  const [activePreset, setActivePreset] = useState(initialPreset ?? null)

  const yearOptions = Array.from(
    { length: 21 },
    (_, i) => today.getFullYear() - 10 + i,
  )

  const defaultLeft = initialStart
    ? new Date(initialStart.getFullYear(), initialStart.getMonth())
    : new Date(2024, 3)
  const [leftMonth, setLeftMonth] = useState(defaultLeft)
  const [fullRange, setFullRange] = useState(null)
  const rightMonth = new Date(leftMonth.getFullYear(), leftMonth.getMonth() + 1)
  const presets = buildPresets(leftMonth.getFullYear(), fullRange)

  const containerRef = useRef(null)

  useEffect(() => {
    let active = true

    const loadFullRange = async () => {
      try {
        const range = await getAllTimeRange()
        if (active && range?.startDate && range?.endDate) {
          setFullRange(range)
        }
      } catch (error) {
        console.error("Failed to load full date range", error)
      }
    }

    loadFullRange()
    return () => {
      active = false
    }
  }, [])

  // Close when clicking outside both the dropdown and the chip button
  useEffect(() => {
    function handleOutside(e) {
      const insideDropdown = containerRef.current?.contains(e.target)
      const insideChip = chipRef?.current?.contains(e.target)
      if (!insideDropdown && !insideChip) onCancel()
    }
    document.addEventListener("mousedown", handleOutside)
    return () => document.removeEventListener("mousedown", handleOutside)
  }, [onCancel, chipRef])

  function handleDayClick(date) {
    if (!start || (start && end)) {
      setStart(startOfDay(date))
      setEnd(null)
      setHover(null)
      setActivePreset(null)
    } else {
      const clicked = startOfDay(date)
      if (clicked < start) {
        setEnd(start)
        setStart(clicked)
      } else {
        setEnd(clicked)
      }
      setHover(null)
    }
  }

  async function handlePreset(preset) {
    let [s, e] = preset.getRange()

    if (
      preset.label === "All Time Range" &&
      (!fullRange?.startDate || !fullRange?.endDate)
    ) {
      try {
        const range = await getAllTimeRange()
        if (range?.startDate && range?.endDate) {
          setFullRange(range)
          s = new Date(range.startDate)
          e = new Date(range.endDate)
        }
      } catch (error) {
        console.error("Failed to load all time range", error)
      }
    }

    setStart(startOfDay(s))
    setEnd(startOfDay(e))
    setHover(null)
    setActivePreset(preset.label)
    setLeftMonth(new Date(s.getFullYear(), s.getMonth()))
  }

  // Clamp left so the dropdown never overflows the right edge of the viewport
  const clampedLeft = Math.min(
    anchor.left,
    window.innerWidth - 648, // 640px width + 8px margin
  )

  return (
    <div
      ref={containerRef}
      className="fixed z-9999 flex overflow-hidden rounded-xl border border-pizzabi-muted/20 bg-pizzabi-main shadow-2xl"
      style={{ top: anchor.top, left: Math.max(8, clampedLeft), width: 640 }}
    >
      {/* ── Quick Select ── */}
      <div className="w-44 shrink-0 border-r border-pizzabi-muted/20 p-3 overflow-y-auto">
        <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-pizzabi-muted">
          Quick Select
        </p>
        <div className="flex flex-col gap-0.5">
          {presets.map((p, i) =>
            p.type === "divider" ? (
              <div
                key={i}
                className="my-1.5 border-t border-pizzabi-muted/20"
              />
            ) : (
              <button
                key={p.label}
                onClick={() => handlePreset(p)}
                className={`rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
                  activePreset === p.label
                    ? "bg-pizzabi-gold/20 font-semibold text-pizzabi-gold"
                    : "text-pizzabi-muted hover:bg-pizzabi-card hover:text-pizzabi-foreground"
                }`}
              >
                {p.label}
              </button>
            ),
          )}
        </div>
      </div>

      {/* ── Calendar panel ── */}
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* selected range display */}
        <div className="flex items-center gap-2 text-xs">
          <div
            className={`flex-1 rounded-lg border px-3 py-1.5 text-center transition-colors ${
              start
                ? "border-pizzabi-gold/50 text-pizzabi-foreground"
                : "border-pizzabi-muted/20 text-pizzabi-muted"
            }`}
          >
            {start ? formatDE(start) : "Start Datum"}
          </div>
          <span className="text-pizzabi-muted">→</span>
          <div
            className={`flex-1 rounded-lg border px-3 py-1.5 text-center transition-colors ${
              end
                ? "border-pizzabi-gold/50 text-pizzabi-foreground"
                : "border-pizzabi-muted/20 text-pizzabi-muted"
            }`}
          >
            {end ? formatDE(end) : "End Datum"}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 rounded-lg border border-pizzabi-muted/20 bg-pizzabi-card/40 px-2 py-2">
          <div className="flex items-center gap-2">
            <select
              value={leftMonth.getFullYear()}
              onChange={(e) =>
                setLeftMonth(
                  new Date(Number(e.target.value), leftMonth.getMonth()),
                )
              }
              className="rounded-md border border-pizzabi-muted/20 bg-pizzabi-main px-2 py-1 text-xs text-pizzabi-foreground"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <select
              value={leftMonth.getMonth()}
              onChange={(e) =>
                setLeftMonth(
                  new Date(leftMonth.getFullYear(), Number(e.target.value)),
                )
              }
              className="rounded-md border border-pizzabi-muted/20 bg-pizzabi-main px-2 py-1 text-xs text-pizzabi-foreground"
            >
              {MONTHS_DE.map((month, index) => (
                <option key={month} value={index}>
                  {month}
                </option>
              ))}
            </select>
          </div>
          <div className="text-[11px] uppercase tracking-wider text-pizzabi-muted">
            Select a range
          </div>
        </div>

        {/* month nav + two calendars */}
        <div className="flex items-start gap-2">
          <button
            onClick={() =>
              setLeftMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1))
            }
            className="mt-1 rounded p-1 text-pizzabi-muted transition-colors hover:bg-pizzabi-card hover:text-pizzabi-foreground"
          >
            <ChevronLeft size={15} />
          </button>

          <div
            className="flex flex-1 gap-6"
            onMouseLeave={() => setHover(null)}
          >
            <CalendarMonth
              year={leftMonth.getFullYear()}
              month={leftMonth.getMonth()}
              start={start}
              end={end}
              hover={hover}
              onDayClick={handleDayClick}
              onDayHover={(d) => !end && setHover(d)}
            />
            <CalendarMonth
              year={rightMonth.getFullYear()}
              month={rightMonth.getMonth()}
              start={start}
              end={end}
              hover={hover}
              onDayClick={handleDayClick}
              onDayHover={(d) => !end && setHover(d)}
            />
          </div>

          <button
            onClick={() =>
              setLeftMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1))
            }
            className="mt-1 rounded p-1 text-pizzabi-muted transition-colors hover:bg-pizzabi-card hover:text-pizzabi-foreground"
          >
            <ChevronRight size={15} />
          </button>
        </div>

        {/* action buttons */}
        <div className="flex justify-end gap-2 border-t border-pizzabi-muted/20 pt-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-pizzabi-muted/30 px-4 py-1.5 text-xs text-pizzabi-muted transition-colors hover:border-pizzabi-muted/60 hover:text-pizzabi-foreground"
          >
            Abbrechen
          </button>
          <button
            onClick={() =>
              start &&
              end &&
              onApply({ start, end, presetLabel: activePreset ?? null })
            }
            disabled={!start || !end}
            className="rounded-lg bg-pizzabi-gold px-4 py-1.5 text-xs font-semibold text-pizzabi-main transition-colors hover:bg-pizzabi-amber disabled:cursor-not-allowed disabled:opacity-40"
          >
            Anwenden
          </button>
        </div>
      </div>
    </div>
  )
}
