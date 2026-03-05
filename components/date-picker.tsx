'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'


const DAYS_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
const DAYS_FULL_VI = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
const MONTHS_VI = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12']
const MONTHS_SHORT_VI = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12']

interface DatePickerProps {
  value: string // YYYY-MM-DD
  max?: string // YYYY-MM-DD
  onChange: (date: string) => void
  placeholder?: string
  className?: string
  allowClear?: boolean
}

export function DatePicker({ value, max, onChange, placeholder = 'Chọn ngày', className, allowClear = false }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const [y, m] = value.split('-').map(Number)
      return new Date(y, m - 1, 1)
    }
    return new Date()
  })
  const [monthPickerMode, setMonthPickerMode] = useState(false)
  const [slideDir, setSlideDir] = useState<'left' | 'right' | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const slideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const maxDate = max ? new Date(max + 'T23:59:59') : null
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Sync viewDate when value changes externally (e.g., from 7-day strip)
  useEffect(() => {
    if (value) {
      const [y, m] = value.split('-').map(Number)
      setViewDate(new Date(y, m - 1, 1))
    }
  }, [value])

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: Event) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setMonthPickerMode(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [open])

  // Lock body scroll on mobile when open
  useEffect(() => {
    if (isMobile && open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isMobile, open])

  // Cleanup slide animation timer on unmount
  useEffect(() => {
    return () => {
      if (slideTimerRef.current) clearTimeout(slideTimerRef.current)
    }
  }, [])

  const toYMD = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const formatDisplay = (d: string) => {
    if (!d) return placeholder
    const [y, m, day] = d.split('-')
    const dateObj = new Date(`${y}-${m}-${day}T12:00:00`)
    const todayStr = toYMD(today)
    const yesterdayStr = toYMD(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1))
    if (d === todayStr) return 'Hôm nay'
    if (d === yesterdayStr) return 'Hôm qua'
    const weekday = DAYS_FULL_VI[dateObj.getDay()]
    return `${weekday}, ${day}/${m}/${y}`
  }

  const getCalendarDays = () => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const first = new Date(year, month, 1)
    const last = new Date(year, month + 1, 0)
    const startPad = first.getDay()
    const daysInMonth = last.getDate()
    const prevMonth = new Date(year, month, 0)
    const prevDays = prevMonth.getDate()
    const rows: { date: Date; isCurrent: boolean; disabled: boolean }[] = []

    for (let i = startPad - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevDays - i)
      rows.push({ date: d, isCurrent: false, disabled: true })
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i)
      rows.push({ date: d, isCurrent: true, disabled: !!(maxDate && d > maxDate) })
    }
    const remaining = 7 - (rows.length % 7)
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        const d = new Date(year, month + 1, i)
        rows.push({ date: d, isCurrent: false, disabled: true })
      }
    }
    return rows
  }

  const goNextMonth = () => {
    setSlideDir('left')
    if (slideTimerRef.current) clearTimeout(slideTimerRef.current)
    slideTimerRef.current = setTimeout(() => setSlideDir(null), 350)
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  }

  const goPrevMonth = () => {
    setSlideDir('right')
    if (slideTimerRef.current) clearTimeout(slideTimerRef.current)
    slideTimerRef.current = setTimeout(() => setSlideDir(null), 350)
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }

  const goNextYear = () => setViewDate((d) => new Date(d.getFullYear() + 1, d.getMonth()))
  const goPrevYear = () => setViewDate((d) => new Date(d.getFullYear() - 1, d.getMonth()))

  const calendarDays = getCalendarDays()
  const selectedStr = value || ''
  const todayStr = toYMD(today)

  const sixDaysAgo = new Date(today)
  sixDaysAgo.setDate(today.getDate() - 6)

  const years = Array.from(
    { length: today.getFullYear() - 2020 + 1 },
    (_, i) => 2020 + i
  )

  const slideClass = slideDir === 'left'
    ? 'animate-in fade-in slide-in-from-left-4'
    : slideDir === 'right'
    ? 'animate-in fade-in slide-in-from-right-4'
    : ''

  // For mobile: render as fixed bottom sheet overlay; for desktop: absolute dropdown
  const popupPositionClass = isMobile
    ? 'fixed inset-x-0 bottom-0 z-[200] rounded-t-3xl'
    : 'absolute top-full left-0 z-[200] mt-2 w-[320px]'

  return (
    <div ref={ref} className={cn('relative', className)}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex w-full items-center gap-2 px-4 py-2.5 rounded-2xl',
          'bg-slate-50 dark:bg-slate-800',
          'text-sm font-medium text-slate-800 dark:text-slate-100',
          'border border-slate-200/60 dark:border-slate-700/60',
          'hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors',
          'shadow-sm'
        )}
      >
        <Calendar className="h-4 w-4 text-emerald-500 shrink-0" />
        <span className="flex-1 text-left truncate">
          {value ? formatDisplay(value) : <span className="text-slate-400">{placeholder}</span>}
        </span>
        {allowClear && value ? (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange('') }}
            className="ml-auto shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform duration-200',
              open && 'rotate-180'
            )}
          />
        )}
      </button>

      {/* Mobile backdrop */}
      {isMobile && open && (
        <div
          className="fixed inset-0 z-[199] bg-black/30 backdrop-blur-sm"
          onClick={() => { setOpen(false); setMonthPickerMode(false) }}
        />
      )}

      {/* Calendar popup */}
      {open && (
        <div
          className={cn(
            'ios-blur border border-slate-200/60 dark:border-slate-700/60 shadow-xl',
            'animate-in fade-in slide-in-from-top-4 duration-200',
            'overflow-visible',
            popupPositionClass
          )}
        >
          {/* Mobile drag handle */}
          {isMobile && (
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
            </div>
          )}

          <div className="p-3">
            {monthPickerMode ? (
              /* Year quick-selector grid */
              <div>
                <div className="flex items-center justify-between mb-2 px-1">
                  <button
                    type="button"
                    onClick={goPrevYear}
                    className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    {viewDate.getFullYear()}
                  </span>
                  <button
                    type="button"
                    onClick={goNextYear}
                    className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pb-1">
                  {years.map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => {
                        setViewDate((d) => new Date(yr, d.getMonth(), 1))
                        setMonthPickerMode(false)
                      }}
                      className={cn(
                        'py-1.5 rounded-xl text-sm font-medium transition-colors',
                        yr === viewDate.getFullYear()
                          ? 'hoverboard-gradient text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                      )}
                    >
                      {yr}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-1 mt-2">
                  {MONTHS_SHORT_VI.map((mn, idx) => (
                    <button
                      key={mn}
                      type="button"
                      onClick={() => {
                        setViewDate((d) => new Date(d.getFullYear(), idx, 1))
                        setMonthPickerMode(false)
                      }}
                      className={cn(
                        'py-1.5 rounded-xl text-xs font-medium transition-colors',
                        idx === viewDate.getMonth()
                          ? 'hoverboard-gradient text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                      )}
                    >
                      {mn}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Calendar view */
              <div>
                {/* Month/Year header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <button
                    type="button"
                    onClick={goPrevMonth}
                    className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMonthPickerMode(true)}
                    className="text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
                  >
                    {MONTHS_VI[viewDate.getMonth()]} {viewDate.getFullYear()}
                  </button>
                  <button
                    type="button"
                    onClick={goNextMonth}
                    className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Day-of-week labels */}
                <div className="grid grid-cols-7 mb-1">
                  {DAYS_VI.map((d) => (
                    <div key={d} className="text-center text-xs font-semibold text-slate-400 dark:text-slate-500 py-1">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Calendar days grid */}
                <div className={cn('grid grid-cols-7 gap-y-0.5', slideClass)}>
                  {calendarDays.map(({ date, isCurrent, disabled }, idx) => {
                    const dStr = toYMD(date)
                    const isSelected = dStr === selectedStr
                    const isToday = dStr === todayStr
                    const isRecent = isCurrent && date >= sixDaysAgo && date <= today && !isSelected
                    const isNonCurrentDisabled = !isCurrent

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={disabled || isNonCurrentDisabled}
                        onClick={() => {
                          if (!disabled && isCurrent) {
                            onChange(dStr)
                            setOpen(false)
                            setMonthPickerMode(false)
                          }
                        }}
                        className={cn(
                          'relative h-9 w-full flex items-center justify-center rounded-xl text-sm transition-all',
                          isSelected && 'hoverboard-gradient text-white font-bold shadow-md shadow-emerald-500/30',
                          !isSelected && isToday && 'ring-1 ring-emerald-400 text-emerald-600 dark:text-emerald-400 font-semibold',
                          !isSelected && !isToday && isCurrent && !disabled && 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10',
                          isRecent && !isSelected && 'bg-emerald-50/30 dark:bg-emerald-900/20',
                          (disabled && isCurrent) && 'opacity-20 pointer-events-none',
                          isNonCurrentDisabled && 'opacity-30 pointer-events-none text-slate-400 dark:text-slate-600',
                        )}
                      >
                        {date.getDate()}
                      </button>
                    )
                  })}
                </div>

                {/* Footer */}
                <div className="flex justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                  <button
                    type="button"
                    onClick={() => {
                      onChange(todayStr)
                      setOpen(false)
                      setMonthPickerMode(false)
                    }}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                  >
                    Hôm nay
                  </button>
                  {allowClear && value && (
                    <button
                      type="button"
                      onClick={() => {
                        onChange('')
                        setOpen(false)
                        setMonthPickerMode(false)
                      }}
                      className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}