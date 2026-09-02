"use client"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import { AnimatePresence, MotionConfig, motion, type Transition, type Variants } from "motion/react"
import { createContext, isValidElement, useContext, useEffect, useId, useState } from "react"
import { createPortal } from "react-dom"
import { Button } from "@b4se/ui"

type PopoverContextValue = {
  isOpen: boolean
  open: () => void
  close: () => void
  uniqueId: string
  variants?: Variants
}

const PopoverContext = createContext<PopoverContextValue | null>(null)

function usePopoverLogic({
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange
}: {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
} = {}) {
  const uniqueId = useId()
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const isOpen = controlledOpen ?? uncontrolledOpen

  const open = () => {
    if (controlledOpen === undefined) setUncontrolledOpen(true)
    onOpenChange?.(true)
  }

  const close = () => {
    if (controlledOpen === undefined) setUncontrolledOpen(false)
    onOpenChange?.(false)
  }

  return { isOpen, open, close, uniqueId }
}

export type PopoverProps = {
  children: React.ReactNode
  transition?: Transition
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  variants?: Variants
} & React.ComponentProps<typeof motion.section>

function Popover({
  children,
  transition = { type: "spring", bounce: 0.05, duration: 0.3, delayChildren: 0.2, staggerChildren: 0.1 },
  defaultOpen,
  open,
  onOpenChange,
  variants = {
    initial: { opacity: 0, filter: "blur(20px)" },
    animate: { opacity: 1, filter: "blur(0px)" },
    exit: { opacity: 0, filter: "blur(20px)" }
  },
  className,
  ...props
}: PopoverProps) {
  const popoverLogic = usePopoverLogic({ defaultOpen, open, onOpenChange })

  return (
    <PopoverContext.Provider value={{ ...popoverLogic, variants }}>
      <MotionConfig transition={transition}>
        <motion.section
          className={cn("relative flex items-center justify-center", className)}
          key={popoverLogic.uniqueId}
          {...props}>
          {children}
        </motion.section>
      </MotionConfig>
    </PopoverContext.Provider>
  )
}

export type PopoverTriggerProps = {
  children: React.ReactNode
  asChild?: boolean
} & React.ComponentProps<typeof motion.button>

function PopoverTrigger({ children, className, asChild = false, ...props }: PopoverTriggerProps) {
  const context = useContext(PopoverContext)
  if (!context) throw new Error("PopoverTrigger must be used within Popover")

  if (asChild && isValidElement(children)) {
    const MotionComponent = motion.create(children.type as React.ForwardRefExoticComponent<any>)
    const childProps = children.props as Record<string, unknown>

    return (
      <MotionComponent
        {...childProps}
        onClick={context.open}
        layoutId={`popover-trigger-${context.uniqueId}`}
        className={cn("w-full", childProps.className!, className)}
        key={context.uniqueId}
        aria-expanded={context.isOpen}
        aria-controls={`popover-content-${context.uniqueId}`}
      />
    )
  }

  return (
    <motion.button
      key={context.uniqueId}
      onClick={context.open}
      layout="position"
      layoutId={`popover-trigger-${context.uniqueId}`}
      className={cn("w-full", className)}
      aria-expanded={context.isOpen}
      aria-controls={`popover-content-${context.uniqueId}`}
      {...props}>
      {children}
    </motion.button>
  )
}

export type PopoverContainerProps = {
  children: React.ReactNode
} & React.ComponentProps<typeof motion.div>

export type PopoverContentProps = {
  children: React.ReactNode
  overlay?: boolean
} & React.ComponentProps<typeof motion.div>

function PopoverContent({ children, className, ...props }: PopoverContentProps) {
  const context = useContext(PopoverContext)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!context) throw new Error("PopoverContent must be used within Popover")
  if (!mounted) return null

  return createPortal(
    <AnimatePresence initial={false} mode="popLayout">
      {context.isOpen && (
        <>
          <motion.div
            onClick={context.close}
            className="fixed inset-0 z-2 size-full bg-black/20"
            initial={{ opacity: 0, transition: { duration: 0.2 } }}
            animate={{ opacity: 1, transition: { duration: 0.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          />
          <motion.div
            layoutId={`popover-trigger-${context.uniqueId}`}
            key={context.uniqueId}
            id={`popover-content-${context.uniqueId}`}
            role="dialog"
            aria-modal="true"
            className={cn(
              "fixed overflow-hidden bg-popover border border-border/50 text-foreground shadow-lg p-8",
              className
            )}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={context.variants}
            {...props}>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}

type PopoverHeaderProps = {
  children: React.ReactNode
  closeButton?: boolean
} & React.ComponentProps<typeof motion.header>

function PopoverHeader({ children, className, closeButton = true, ...props }: PopoverHeaderProps) {
  const context = useContext(PopoverContext)
  if (!context) throw new Error("PopoverHeader must be used within Popover")

  return (
    <motion.header {...props} className={cn("flex items-center justify-between mb-4", className)}>
      {children}
      {closeButton && (
        <Button onClick={context.close} variant="ghost" size="sm" className="p-4 items-center justify-center">
          <X className="size-4" />
        </Button>
      )}
    </motion.header>
  )
}

export function usePopover() {
  const context = useContext(PopoverContext)
  if (!context) throw new Error("usePopover must be used within Popover")
  return context
}

export { Popover, PopoverContent, PopoverHeader, PopoverTrigger }
