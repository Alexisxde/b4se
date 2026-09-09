"use client"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { createContext, useContext, type ComponentProps } from "react"
import { Button } from "../button"
import { useCalendar, type UseCalendarOptions } from "./use-calendar"

type CalendarContextValue = ReturnType<typeof useCalendar>
const CalendarContext = createContext<CalendarContextValue | null>(null)

function useCalendarContext() {
  const context = useContext(CalendarContext)
  if (!context) throw new Error("Calendar components must be used within Calendar")
  return context
}

type CalendarProps = UseCalendarOptions & ComponentProps<"section">

function Calendar({ children, value, onValueChange, className }: CalendarProps) {
  const calendar = useCalendar({ value, onValueChange })

  return (
    <CalendarContext value={calendar}>
      <section className={cn("relative flex w-full flex-col", className)}>{children}</section>
    </CalendarContext>
  )
}

export type CalendarPreviewProps = {
  label: string
  placeholder?: string
  error?: string
  labelClassName?: string
  valueClassName?: string
} & Omit<ComponentProps<"div">, "children">

function CalendarPreview({
  label,
  placeholder = "Seleccionar fecha",
  error,
  className,
  labelClassName,
  valueClassName,
  ...props
}: CalendarPreviewProps) {
  const { formattedValue } = useCalendarContext()

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div
        className={cn(
          "relative flex flex-col justify-center",
          "bg-card border border-outline p-4 min-h-16 rounded-xl",
          "w-full transition-all duration-200 ease-in-out",
          "cursor-pointer focus-within:ring-1 focus-within:ring-ring/50",
          error && "border-destructive focus-within:ring-destructive/50",
          className
        )}
        {...props}>
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "text-xs font-medium text-muted-foreground select-none cursor-pointer",
              error && "text-destructive",
              labelClassName
            )}>
            {label}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className={cn(
              "w-full text-sm truncate",
              formattedValue ? "text-foreground" : "text-muted-foreground/60",
              valueClassName
            )}>
            {formattedValue || placeholder}
          </span>
        </div>
      </div>
      {error && (
        <p role="alert" aria-live="polite" className="text-destructive text-xs font-medium pl-1">
          {error}
        </p>
      )}
    </div>
  )
}

type CalendarContentProps = ComponentProps<"section">

function CalendarContent({ className, ...props }: CalendarContentProps) {
  return <section className={cn("w-sm", className)} {...props} />
}

type CalendarHeaderProps = ComponentProps<"header">

function CalendarHeader({ className, ...props }: CalendarHeaderProps) {
  return <header className={cn("flex items-center justify-between px-2 pb-4", className)} {...props} />
}

type CalendarMonthProps = ComponentProps<"h2">

function CalendarMonth({ className, ...props }: CalendarMonthProps) {
  const { monthName, year } = useCalendarContext()

  return (
    <h2 className={cn("text-sm font-medium capitalize", className)} {...props}>
      {monthName} {year}
    </h2>
  )
}

type CalendarControlsProps = ComponentProps<"div">

export function CalendarControls({ className, ...props }: CalendarControlsProps) {
  const { previousMonth, nextMonth } = useCalendarContext()

  return (
    <div className={cn("flex gap-1", className)} {...props}>
      <Button variant="secondary" size="xs" onClick={previousMonth} className="rounded-full">
        <ChevronLeft className="size-4" />
      </Button>
      <Button variant="secondary" size="xs" onClick={nextMonth} className="rounded-full">
        <ChevronRight className="size-4" />
      </Button>
    </div>
  )
}

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

export function CalendarDays({ className, ...props }: ComponentProps<"div">) {
  const { days, selectDate, isSelected, isToday } = useCalendarContext()

  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      <div className="grid grid-cols-7 text-center">
        {DAYS.map((day) => (
          <div key={day} className="text-[10px] font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 place-items-center gap-1">
        {days.map(({ day, date, month }, index) => {
          const selected = isSelected(date)
          const today = isToday(date)
          const isCurrentMonth = month === "current"

          return (
            <button
              key={`${date.toISOString()}-${index}`}
              type="button"
              onClick={() => selectDate(selected ? undefined : date)}
              className={cn(
                "flex size-10 cursor-pointer items-center justify-center rounded-full text-xs",
                "transition-colors duration-150",
                !isCurrentMonth && "text-muted-foreground/30",
                isCurrentMonth && !selected && "hover:bg-muted",
                selected && isCurrentMonth && "bg-primary font-bold text-primary-foreground",
                selected && !isCurrentMonth && "bg-primary/30 font-bold text-primary-foreground",
                today && !selected && "font-bold text-primary ring-1 ring-input"
              )}>
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

Calendar.Preview = CalendarPreview
Calendar.Content = CalendarContent
Calendar.Header = CalendarHeader
Calendar.Month = CalendarMonth
Calendar.Controls = CalendarControls
Calendar.Days = CalendarDays

export { Calendar }
