"use client"

import { useEffect, useMemo, useState } from "react"

export type CalendarDay = {
  day: number
  date: Date
  month: "prev" | "current" | "next"
}

export type UseCalendarOptions = {
  value?: Date
  onValueChange?: (value: Date | undefined) => void
}

export function useCalendar({ value, onValueChange }: UseCalendarOptions = {}) {
  const [viewDate, setViewDate] = useState<Date>(value ?? new Date())

  // Si el valor externo cambia, actualizamos la vista.
  useEffect(() => {
    if (value) {
      setViewDate(value)
    }
  }, [value])

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const monthName = viewDate.toLocaleDateString("es-ES", {
    month: "long"
  })

  const formattedValue = value
    ? value.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric"
      })
    : null

  const days = useMemo<CalendarDay[]>(() => {
    const firstDayOfMonth = new Date(year, month, 1).getDay()

    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const daysInPreviousMonth = new Date(year, month, 0).getDate()

    const calendarDays: CalendarDay[] = []

    // Días del mes anterior
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      calendarDays.push({
        day: daysInPreviousMonth - i,
        month: "prev",
        date: new Date(year, month - 1, daysInPreviousMonth - i)
      })
    }

    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push({
        day: i,
        month: "current",
        date: new Date(year, month, i)
      })
    }

    // Días del mes siguiente
    const remainingDays = 42 - calendarDays.length

    for (let i = 1; i <= remainingDays; i++) {
      calendarDays.push({
        day: i,
        month: "next",
        date: new Date(year, month + 1, i)
      })
    }

    return calendarDays
  }, [year, month])

  const previousMonth = () => {
    setViewDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setViewDate(new Date(year, month + 1, 1))
  }

  const goToMonth = (date: Date) => {
    setViewDate(new Date(date.getFullYear(), date.getMonth(), 1))
  }

  const selectDate = (date?: Date) => {
    onValueChange?.(date)
  }

  const isSelected = (date: Date) => {
    if (!value) return false

    return (
      date.getDate() === value.getDate() &&
      date.getMonth() === value.getMonth() &&
      date.getFullYear() === value.getFullYear()
    )
  }

  const isToday = (date: Date) => {
    const today = new Date()

    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  return {
    value,
    viewDate,
    year,
    month,
    monthName,
    formattedValue,
    days,
    setViewDate,
    goToMonth,
    previousMonth,
    nextMonth,
    selectDate,
    isSelected,
    isToday
  }
}
