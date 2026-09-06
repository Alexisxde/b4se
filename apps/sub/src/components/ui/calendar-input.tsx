"use client"
import useClickOutside from "@/hooks/use-click-outside"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { AnimatePresence, MotionConfig, motion, type Transition, type Variants } from "motion/react"
import { createContext, isValidElement, useContext, useId, useRef, useState } from "react"

type CalendarContextValue = {
  isOpen: boolean
  open: () => void
  close: () => void
  uniqueId: string
  variants?: Variants
  value?: Date
  onValueChange?: (value: Date | undefined) => void
  selectedLabel: string | null
}

const CalendarContext = createContext<CalendarContextValue | null>(null)

function useCalendarLogic({
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  value: controlledValue,
  onValueChange
}: {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  value?: Date
  onValueChange?: (value?: Date) => void
} = {}) {
  const uniqueId = useId()
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const [uncontrolledValue, setUncontrolledValue] = useState<Date | undefined>(undefined)

  const isOpen = controlledOpen ?? uncontrolledOpen
  const value = controlledValue ?? uncontrolledValue

  const open = () => {
    if (!controlledOpen) setUncontrolledOpen(true)
    onOpenChange?.(true)
  }

  const close = () => {
    if (!controlledOpen) setUncontrolledOpen(false)
    onOpenChange?.(false)
  }

  const handleValueChange = (newValue?: Date) => {
    if (!controlledValue) setUncontrolledValue(newValue)
    onValueChange?.(newValue)
    close()
  }

  const formatDate = (date?: Date) => {
    if (!date) return null
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric"
    })
  }

  return {
    isOpen,
    open,
    close,
    uniqueId,
    value,
    onValueChange: handleValueChange,
    selectedLabel: formatDate(value)
  }
}

function useCalendar() {
  const context = useContext(CalendarContext)
  if (!context) throw new Error("Calendar components must be used within Calendar")
  return context
}

export type CalendarProps = {
  children: React.ReactNode
  transition?: Transition
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  variants?: Variants
  className?: string
  value?: Date
  onValueChange?: (value: Date | undefined) => void
} & React.ComponentProps<"div">

export function Calendar({
  children,
  transition = { type: "spring", bounce: 0.05, duration: 0.3 },
  defaultOpen,
  open,
  onOpenChange,
  variants,
  className,
  value,
  onValueChange,
  ...props
}: CalendarProps) {
  const calendarLogic = useCalendarLogic({ defaultOpen, open, onOpenChange, value, onValueChange })

  return (
    <CalendarContext.Provider value={{ ...calendarLogic, variants }}>
      <MotionConfig transition={transition}>
        <div
          key={calendarLogic.uniqueId}
          className={cn("relative flex w-full flex-col items-center justify-center", className)}
          {...props}>
          {children}
        </div>
      </MotionConfig>
    </CalendarContext.Provider>
  )
}

type CalendarValueProps = {
  placeholder: string
} & React.ComponentProps<typeof motion.span>

export function CalendarValue({ placeholder, className, ...props }: CalendarValueProps) {
  const { selectedLabel } = useCalendar()
  return (
    <motion.span
      className={cn("truncate", className, {
        "text-muted-foreground": selectedLabel === null
      })}
      {...props}>
      {selectedLabel || placeholder}
    </motion.span>
  )
}

export type CalendarContentProps = {
  className?: string
} & React.ComponentProps<typeof motion.div>

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre"
]

export function CalendarContent({ className }: CalendarContentProps) {
  const { isOpen, close, uniqueId, variants, value, onValueChange } = useCalendar()
  const ref = useRef<HTMLDivElement>(null!)
  useClickOutside(ref, close)

  const [viewDate, setViewDate] = useState(value || new Date())
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPreviousMonth = new Date(year, month, 0).getDate()

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1))
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1))

  const calendarDays = []
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPreviousMonth - i,
      month: "prev",
      date: new Date(year, month - 1, daysInPreviousMonth - i)
    })
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      month: "current",
      date: new Date(year, month, i)
    })
  }
  const remainingDays = 42 - calendarDays.length
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({
      day: i,
      month: "next",
      date: new Date(year, month + 1, i)
    })
  }

  const isSelected = (date: Date) =>
    value &&
    date.getDate() === value.getDate() &&
    date.getMonth() === value.getMonth() &&
    date.getFullYear() === value.getFullYear()

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  return (
    <AnimatePresence initial={false} mode="sync">
      {isOpen && (
        <motion.div
          ref={ref}
          layoutId={`select-trigger-${uniqueId}`}
          key={uniqueId}
          id={`calendar-content-${uniqueId}`}
          className={cn(
            "absolute overflow-hidden border border-outlinebg-card text-primary shadow-md w-sm h-auto p-4 z-10 rounded-3xl",
            className
          )}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-sm font-semibold">
                {MONTHS[month]} {year}
              </h2>
              <div className="flex gap-1">
                <button onClick={prevMonth} className="p-1 rounded-full hover:bg-muted transition-colors" type="button">
                  <ChevronLeft className="size-4" />
                </button>
                <button onClick={nextMonth} className="p-1 rounded-full hover:bg-muted transition-colors" type="button">
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 text-center">
              {DAYS.map((day) => (
                <div key={day} className="text-[10px] font-medium text-muted-foreground uppercase">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {calendarDays.map(({ day, month: dayMonth, date }, idx) => {
                const selected = isSelected(date)
                const today = isToday(date)
                const isCurrentMonth = dayMonth === "current"

                return (
                  <button
                    key={idx}
                    onClick={() => onValueChange?.(selected ? undefined : date)}
                    type="button"
                    className={cn(
                      "size-10 flex items-center justify-center rounded-full text-xs transition-all duration-200 ease-in-out cursor-pointer",
                      !isCurrentMonth && "text-muted-foreground/30",
                      isCurrentMonth && !selected && "hover:bg-muted",
                      selected && isCurrentMonth && "bg-primary text-primary-foreground font-bold",
                      selected && !isCurrentMonth && "bg-primary/30 text-primary-foreground font-bold",
                      today && !selected && "ring-1 ring-input text-primary font-bold"
                    )}>
                    {day}
                  </button>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export type CalendarTriggerProps = {
  children?: React.ReactNode
  asChild?: boolean
  label: string
  error?: boolean
  placeholder?: string
  classValue?: string
  classLabel?: string
} & React.ComponentProps<typeof motion.div>

export function CalendarTrigger({
  children,
  className,
  classLabel,
  classValue,
  label,
  error,
  placeholder,
  asChild = false,
  ...props
}: CalendarTriggerProps) {
  const { isOpen, open, uniqueId } = useCalendar()
  if (asChild && isValidElement(children)) {
    const MotionComponent = motion.create(children.type as React.ForwardRefExoticComponent<any>)
    const childProps = children.props as Record<string, unknown>

    return (
      <MotionComponent
        {...childProps}
        onClick={(e: React.MouseEvent) => {
          e.preventDefault()
          open()
        }}
        layoutId={`select-trigger-${uniqueId}`}
        className={cn("w-full cursor-pointer", childProps.className!, className)}
        key={uniqueId}
        aria-expanded={isOpen}
        aria-controls={`calendar-content-${uniqueId}`}
      />
    )
  }

  return (
    <motion.div
      key={uniqueId}
      layoutId={`select-trigger-${uniqueId}`}
      onClick={open}
      aria-expanded={isOpen}
      className="w-full">
      <motion.div
        animate={error ? { x: [0, -24, 24, -24, 24, 0] } : { x: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className={cn(
          "relative flex flex-col gap-1 bg-card shadow-[0_0_0_.5px_#0000000d,0_.5px_2.5px_#00000029] dark:shadow-[0_0_0_.5px_#2d372d,0_.5px_2.5px_#00000029] p-4 h-18 rounded-xl w-full transition-all duration-200 ease-in-out cursor-pointer",
          className,
          { "ring-2 ring-destructive": error }
        )}
        {...props}>
        <CalendarTitle title={label} className={cn("text-xs text-label", classLabel)} />
        <CalendarValue
          placeholder={placeholder ?? "Seleccionar fecha"}
          className={cn(
            "absolute inset-0 top-4 px-4 pt-4.5 focus:outline-none text-foreground text-sm text-ellipsis",
            classValue
          )}
        />
      </motion.div>
    </motion.div>
  )
}

type CalendarTitleProps = {
  title: string
} & React.ComponentProps<typeof motion.span>

export function CalendarTitle({ title, className, ...props }: CalendarTitleProps) {
  const { uniqueId } = useCalendar()
  return (
    <motion.span
      layout="position"
      layoutId={`select-title-${uniqueId}`}
      className={cn("text-xl font-medium text-primary", className)}
      {...props}>
      {title}
    </motion.span>
  )
}

export function CalendarMessageError({
  message,
  className,
  ...props
}: { message?: string } & React.ComponentProps<typeof motion.p>) {
  return message ? (
    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn("text-left w-full mt-3 text-destructive text-xs", className)}
      {...props}>
      {message}
    </motion.p>
  ) : null
}
