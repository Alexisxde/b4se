"use client"
import useClickOutside from "@/hooks/use-click-outside"
import { cn } from "@/lib/utils"
import { AnimatePresence, MotionConfig, motion, type Transition, type Variants } from "motion/react"
import {
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode
} from "react"

type SelectContextValue = {
  isOpen: boolean
  open: () => void
  close: () => void
  uniqueId: string
  variants?: Variants
  value?: any
  onValueChange?: (value: any) => void
  selectedContent: ReactNode | null
  reportContent: (value: any, content: ReactNode) => void
}

const SelectContext = createContext<SelectContextValue | null>(null)

function useSelectLogic({
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  value: controlledValue,
  onValueChange
}: {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  value?: any
  onValueChange?: (value: any) => void
} = {}) {
  const uniqueId = useId()
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const [uncontrolledValue, setUncontrolledValue] = useState<any>(undefined)
  const [contents, setContents] = useState<Record<string, ReactNode>>({})

  const isOpen = controlledOpen ?? uncontrolledOpen
  const value = controlledValue ?? uncontrolledValue

  const open = () => {
    if (controlledOpen === undefined) setUncontrolledOpen(true)
    onOpenChange?.(true)
  }

  const close = () => {
    if (controlledOpen === undefined) setUncontrolledOpen(false)
    onOpenChange?.(false)
  }

  const handleValueChange = (newValue: any) => {
    if (controlledValue === undefined) setUncontrolledValue(newValue)
    onValueChange?.(newValue)
    close()
  }

  const reportContent = (val: any, content: ReactNode) => {
    const key = String(val)
    setContents((prev) => {
      if (prev[key] === content) return prev
      return { ...prev, [key]: content }
    })
  }

  return {
    isOpen,
    open,
    close,
    uniqueId,
    value,
    onValueChange: handleValueChange,
    selectedContent: contents[String(value)] || null,
    reportContent
  }
}

export function useSelect() {
  const context = useContext(SelectContext)
  if (!context) throw new Error("Select compound components must be used within Select")
  return context
}

export interface SelectProps extends ComponentProps<"div"> {
  children?: ReactNode
  transition?: Transition
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  variants?: Variants
  value?: any
  onValueChange?: (value: any) => void
}

export function Select({
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
}: SelectProps) {
  const selectLogic = useSelectLogic({ defaultOpen, open, onOpenChange, value, onValueChange })

  return (
    <SelectContext.Provider value={{ ...selectLogic, variants }}>
      <MotionConfig transition={transition}>
        <div
          key={selectLogic.uniqueId}
          className={cn("relative flex flex-col items-center justify-center", className)}
          {...props}>
          {children}
        </div>
      </MotionConfig>
    </SelectContext.Provider>
  )
}

export interface SelectValueProps extends ComponentProps<typeof motion.div> {
  placeholder?: string
}

export function SelectValue({ placeholder = "Seleccionar", className, ...props }: SelectValueProps) {
  const { selectedContent } = useSelect()
  return (
    <motion.div
      className={cn("truncate flex items-center gap-1", className, {
        "text-muted-foreground": selectedContent === null
      })}
      {...props}>
      {selectedContent || placeholder}
    </motion.div>
  )
}

export interface SelectContentProps extends ComponentProps<typeof motion.div> {
  children?: ReactNode
}

export function SelectContent({ children, className, ...props }: SelectContentProps) {
  const { isOpen, close, uniqueId, variants } = useSelect()
  const ref = useRef<HTMLDivElement>(null!)
  useClickOutside(ref, close)

  return (
    <AnimatePresence initial={false} mode="popLayout">
      {isOpen && (
        <motion.div
          ref={ref}
          layoutId={`select-trigger-${uniqueId}`}
          key={uniqueId}
          id={`select-content-${uniqueId}`}
          role="listbox"
          aria-modal="true"
          className={cn(
            "absolute overflow-hidden border border-outline bg-card text-primary shadow-md w-full h-auto p-4 z-10 rounded-3xl",
            className
          )}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants}
          {...props}>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export interface SelectItemProps extends ComponentProps<typeof motion.div> {
  value: string
  children?: ReactNode
}

export function SelectItem({ value, children, className, onClick, ...props }: SelectItemProps) {
  const { value: v, reportContent, onValueChange } = useSelect()
  const isSelected = v === value

  useEffect(() => {
    reportContent(value, children)
  }, [value, children, reportContent])

  return (
    <motion.div
      role="option"
      aria-selected={isSelected}
      onClick={(e) => {
        onClick?.(e)
        onValueChange?.(isSelected ? undefined : value)
      }}
      className={cn(
        "relative flex w-full text-muted-foreground cursor-pointer select-none items-center rounded-md py-2 px-3 text-sm outline-none transition-colors duration-200 ease-in-out font-medium hover:bg-muted",
        isSelected && "bg-muted font-semibold",
        className
      )}
      {...props}>
      {children}
    </motion.div>
  )
}

export interface SelectMessageErrorProps extends ComponentProps<typeof motion.p> {
  message?: string
}

export function SelectMessageError({ message, className, children, ...props }: SelectMessageErrorProps) {
  const content = message ?? children
  if (!content) return null

  return (
    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn("text-left w-full my-3 text-destructive text-xs", className)}
      {...props}>
      {content}
    </motion.p>
  )
}

export interface SelectTitleProps extends ComponentProps<typeof motion.span> {
  title?: string
  children?: ReactNode
}

export function SelectTitle({ title, children, className, ...props }: SelectTitleProps) {
  const { uniqueId } = useSelect()
  return (
    <motion.span
      layout="position"
      layoutId={`select-title-${uniqueId}`}
      className={cn("text-xl font-medium text-primary", className)}
      {...props}>
      {children ?? title}
    </motion.span>
  )
}

export interface SelectTriggerProps extends ComponentProps<typeof motion.div> {
  children?: ReactNode
  asChild?: boolean
  label?: string
  error?: boolean
  placeholder?: string
  classValue?: string
  classLabel?: string
}

export function SelectTrigger({
  children,
  className,
  classLabel,
  classValue,
  label,
  error,
  placeholder,
  asChild = false,
  onClick,
  ...props
}: SelectTriggerProps) {
  const { isOpen, open, close, uniqueId } = useSelect()

  const handleToggle = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    onClick?.(e)
    if (isOpen) close()
    else open()
  }

  if (asChild && isValidElement(children)) {
    const MotionComponent = motion.create(children.type as React.ForwardRefExoticComponent<any>)
    const childProps = children.props as Record<string, unknown>

    return (
      <MotionComponent
        {...childProps}
        onClick={handleToggle}
        layoutId={`select-trigger-${uniqueId}`}
        className={cn("w-full cursor-pointer", childProps.className as string, className)}
        key={uniqueId}
        aria-expanded={isOpen}
        aria-controls={`select-content-${uniqueId}`}
      />
    )
  }

  return (
    <motion.div key={uniqueId} layoutId={`select-trigger-${uniqueId}`} onClick={handleToggle} aria-expanded={isOpen}>
      <motion.div
        animate={error ? { x: [0, -24, 24, -24, 24, 0] } : { x: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className={cn(
          "relative flex flex-col gap-1 bg-card shadow-[0_0_0_.5px_#0000000d,0_.5px_2.5px_#00000029] dark:shadow-[0_0_0_.5px_#2d372d,0_.5px_2.5px_#00000029] p-4 h-18 rounded-xl w-sm hover:ring-2 hover:ring-input transition-all duration-200 ease-in-out cursor-pointer",
          className,
          { "ring-2 ring-destructive hover:ring-destructive": error }
        )}
        {...props}>
        {label && <SelectTitle title={label} className={cn("text-xs text-label", classLabel)} />}
        <SelectValue
          placeholder={placeholder ?? "Seleccionar"}
          className={cn(
            "absolute inset-0 px-4 pt-4.5 focus:outline-none text-foreground text-sm text-ellipsis pointer-events-none",
            classValue
          )}
        />
        {children}
      </motion.div>
    </motion.div>
  )
}

export interface SelectGroupProps extends ComponentProps<typeof motion.section> {
  children?: ReactNode
}

export function SelectGroup({ children, className, ...props }: SelectGroupProps) {
  return (
    <motion.section className={cn("flex flex-col gap-1 mt-2", className)} {...props}>
      {children}
    </motion.section>
  )
}

// Attach compound components to Select
Select.Trigger = SelectTrigger
Select.Content = SelectContent
Select.Item = SelectItem
Select.Value = SelectValue
Select.Title = SelectTitle
Select.Group = SelectGroup
Select.Error = SelectMessageError
Select.MessageError = SelectMessageError

export {
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTitle,
  SelectGroup,
  SelectMessageError,
  SelectMessageError as SelectError
}
