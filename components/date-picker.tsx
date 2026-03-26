'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

const DAYS_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
const MONTHS_VI = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12']

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
  const ref = useRef<HTMLDivElement>(null)

  const maxDate = max ? new Date(max + 'T23:59:59') : null
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  useEffect(() => {
    function handleClickOutside(e: Event) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
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

  const formatDisplay = (d: string) => {
    if (!d) return placeholder
    const [y, m, day] = d.split('-')
    return `${day.padStart(2, '0')}/${m}/${y}`
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
      d.setHours(0, 0, 0, 0)
      rows.push({ date: d, isCurrent: false, disabled: !!maxDate && d > maxDate })
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i)
      d.setHours(0, 0, 0, 0)
      rows.push({ date: d, isCurrent: true, disabled: !!maxDate && d > maxDate })
    }
    const remaining = 42 - rows.length
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i)
      d.setHours(0, 0, 0, 0)
      rows.push({ date: d, isCurrent: false, disabled: !!maxDate && d > maxDate })
    }
    return rows
  }

  const toYMD = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const selectDate = (d: Date) => {
    if (maxDate && d > maxDate) return
    onChange(toYMD(d))
    setOpen(false)
  }

  const goPrevMonth = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1))
  }

  const goNextMonth = () => {
    const next = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1)
    if (maxDate && next > maxDate) return
    setViewDate(next)
  }

  const selectToday = () => {
    if (maxDate && today > maxDate) return
    onChange(toYMD(today))
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))
    setOpen(false)
  }

  const clearDate = () => {
    onChange('')
    setOpen(false)
  }

  const selectedDate = value ? new Date(value + 'T12:00:00') : null
  const [portalStyle, setPortalStyle] = useState<React.CSSProperties>({})
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Position calendar below or above button depending on available space
  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const calendarHeight = 420
      const spaceBelow = window.innerHeight - rect.bottom - 8
      const spaceAbove = rect.top - 8
      const showAbove = spaceBelow < calendarHeight && spaceAbove > spaceBelow
      const width = Math.max(320, rect.width)
      const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8)

      setPortalStyle({
        position: 'fixed',
        top: showAbove ? rect.top - calendarHeight - 8 : rect.bottom + 8,
        left,
        width,
        zIndex: 9999,
      })
    }
  }, [open])

  const CalendarDropdown = (
    <div
      style={{ ...portalStyle, boxShadow: '0 25px 60px rgba(0,0,0,0.35), 0 8px 20px rgba(0,0,0,0.2)' }}
      className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 border border-slate-200/50 dark:border-white/10 animate-in fade-in slide-in-from-top-4 duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={goPrevMonth} className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors" aria-label="Tháng trước">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="font-bold text-slate-900 dark:text-white text-base tracking-tight">
          {MONTHS_VI[viewDate.getMonth()]} {viewDate.getFullYear()}
        </span>
        <button type="button" onClick={goNextMonth} className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50" aria-label="Tháng sau" disabled={!!(maxDate && new Date(viewDate.getFullYear(), viewDate.getMonth() + 1) > maxDate)}>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS_VI.map((day) => (
          <div key={day} className="text-center text-[11px] font-semibold text-slate-400 dark:text-slate-500 py-1 uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {getCalendarDays().map(({ date, isCurrent, disabled }, i) => {
          const isSelected = selectedDate && toYMD(date) === toYMD(selectedDate)
          const isTodayDate = toYMD(date) === toYMD(today)
          return (
            <button
              key={i}
              type="button"
              onClick={() => selectDate(date)}
              disabled={disabled}
              className={cn(
                'aspect-square rounded-xl text-sm font-bold transition-all min-w-[38px] min-h-[38px] flex items-center justify-center relative',
                disabled && 'opacity-20 cursor-not-allowed',
                isSelected && 'hoverboard-gradient text-white shadow-lg shadow-emerald-500/25 scale-110',
                !isSelected && !disabled && 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200',
                !isCurrent && !isSelected && 'text-slate-300 dark:text-slate-600',
                isTodayDate && !isSelected && !disabled && 'text-emerald-600 dark:text-emerald-400'
              )}
            >
              {date.getDate()}
              {isTodayDate && !isSelected && (
                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-500" />
              )}
            </button>
          )
        })}
      </div>

      {/* Footer */}
      <div className="flex justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        {allowClear ? (
          <button type="button" onClick={clearDate} className="text-sm font-semibold text-slate-500 hover:text-slate-700">Xóa</button>
        ) : <span />}
        <button type="button" onClick={selectToday} className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">Hôm nay</button>
      </div>
    </div>
  )

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-50 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 border-none"
      >
        <Calendar className="h-4 w-4 text-emerald-500 shrink-0" />
        <span className={value ? '' : 'text-slate-400'}>{formatDisplay(value)}</span>
      </button>

      {open && typeof document !== 'undefined' && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setOpen(false)}
          />
          {CalendarDropdown}
        </>,
        document.body
      )}
    </div>
  )
}
