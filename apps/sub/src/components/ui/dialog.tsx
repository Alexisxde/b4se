"use client"
import useClickOutside from "@/hooks/use-click-outside"
import { cn } from "@/lib/utils"
import { Button, type ButtonProps } from "@b4se/ui"
import { X } from "lucide-react"
import { AnimatePresence, motion, MotionConfig, type Transition } from "motion/react"
import React, {
  isValidElement,
  memo,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState
} from "react"
import { createPortal } from "react-dom"

export type DialogContextType = {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  uniqueId: string
  triggerRef: React.RefObject<HTMLButtonElement | null>
}

const DialogContext = React.createContext<DialogContextType | null>(null)

function useDialog() {
  const context = useContext(DialogContext)
  if (!context) throw new Error("useDialog must be used within a DialogProvider")
  return context
}

export type DialogProviderProps = {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  children: React.ReactNode
  transition?: Transition
}

function DialogProvider({ children, transition, isOpen, setIsOpen }: DialogProviderProps) {
  const uniqueId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null!)
  const contextValue = useMemo(() => ({ isOpen, setIsOpen, uniqueId, triggerRef }), [isOpen, setIsOpen, uniqueId])

  return (
    <DialogContext.Provider value={contextValue}>
      <MotionConfig transition={transition}>{children}</MotionConfig>
    </DialogContext.Provider>
  )
}

export type DialogProps = {} & DialogProviderProps

export function Dialog({
  children,
  transition = { type: "spring", stiffness: 200, damping: 24 },
  isOpen,
  setIsOpen
}: DialogProps) {
  return (
    <DialogProvider isOpen={isOpen} setIsOpen={setIsOpen}>
      <MotionConfig transition={transition}>{children}</MotionConfig>
    </DialogProvider>
  )
}

export type DialogTriggerProps = React.ComponentProps<typeof motion.button> & { asChild?: boolean }

export const DialogTrigger = memo(
  ({
    children,
    className,
    asChild = false,
    variants = {
      initial: { opacity: 0, filter: "blur(4px)", transition: { duration: 0.2 } },
      animate: { opacity: 1, filter: "blur(0px)", transition: { duration: 0.2 } },
      exit: { opacity: 0, filter: "blur(4px)", transition: { duration: 0.2 } }
    },
    ...props
  }: DialogTriggerProps) => {
    const { setIsOpen, uniqueId, triggerRef } = useDialog()
    const handleOpen = useCallback(() => setIsOpen(true), [setIsOpen])

    if (asChild && isValidElement(children)) {
      const MotionComponent = motion.create(children.type as React.ForwardRefExoticComponent<any>)
      const childProps = children.props as Record<string, any>

      return (
        <MotionComponent
          key={uniqueId}
          onClick={handleOpen}
          ref={triggerRef}
          layout="position"
          layoutId={`dialog-${uniqueId}`}
          className={cn("focus:outline-none border-border bg-card rounded-xl border", childProps.className)}
          variants={variants}
          {...childProps}
        />
      )
    }

    return (
      <motion.button
        key={uniqueId}
        layoutId={`dialog-${uniqueId}`}
        layout="position"
        onClick={handleOpen}
        ref={triggerRef}
        className={cn("focus:outline-none", className)}
        variants={variants}
        {...props}>
        {children}
      </motion.button>
    )
  }
)

export type DialogContentProps = {
  children: React.ReactNode
} & React.ComponentProps<typeof motion.section>

export function DialogContent({ children, className, ...props }: DialogContentProps) {
  const { setIsOpen, isOpen, uniqueId, triggerRef } = useDialog()
  const containerRef = useRef<HTMLDivElement>(null!)
  const [firstFocusableElement, setFirstFocusableElement] = useState<HTMLElement | null>(null)
  const [lastFocusableElement, setLastFocusableElement] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false)
      if (event.key === "Tab") {
        if (!firstFocusableElement || !lastFocusableElement) return
        if (event.shiftKey) {
          if (document.activeElement === firstFocusableElement) {
            event.preventDefault()
            lastFocusableElement.focus()
          }
        } else {
          if (document.activeElement === lastFocusableElement) {
            event.preventDefault()
            firstFocusableElement.focus()
          }
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [setIsOpen, firstFocusableElement, lastFocusableElement])

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden")
      const focusableElements = containerRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusableElements && focusableElements.length > 0) {
        setFirstFocusableElement(focusableElements[0] as HTMLElement)
        setLastFocusableElement(focusableElements[focusableElements.length - 1] as HTMLElement)
        ;(focusableElements[0] as HTMLElement).focus()
      }
    } else {
      document.body.classList.remove("overflow-hidden")
      triggerRef.current?.focus()
    }
  }, [isOpen, triggerRef])

  useClickOutside(containerRef, () => {
    if (isOpen) setIsOpen(false)
  })

  return (
    <motion.section
      ref={containerRef}
      layout="position"
      layoutId={`dialog-${uniqueId}`}
      initial={{ opacity: 0, filter: "blur(4px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(4px)" }}
      className={cn("bg-card border-border relative overflow-hidden rounded-lg border p-4", className)}
      {...props}>
      {children}
    </motion.section>
  )
}

export type DialogContainerProps = {
  children: React.ReactNode
  overlay?: boolean
} & React.ComponentProps<typeof motion.div>

export function DialogContainer({
  children,
  className,
  overlay = true,
  variants = {
    initial: { opacity: 0, scale: 0, transition: { duration: 0.2 } },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0, transition: { duration: 0.2 } }
  },
  ...props
}: DialogContainerProps) {
  const { isOpen, uniqueId } = useDialog()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) return null

  const Overlay = () => {
    return (
      <motion.div
        key={`backdrop-${uniqueId}`}
        className={cn(
          "fixed inset-0 z-50 size-full bg-white/40 backdrop-blur-xs rounded-xl dark:bg-black/40",
          className
        )}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        {...props}
      />
    )
  }

  return createPortal(
    <AnimatePresence initial={false} mode="sync">
      {isOpen ? (
        <>
          {overlay ? <Overlay /> : null}
          <div className={cn("fixed inset-0 z-50 flex items-center justify-center", className)}>{children}</div>
        </>
      ) : null}
    </AnimatePresence>,
    document.body
  )
}

export type DialogTitleProps = {
  children: React.ReactNode
} & React.ComponentProps<typeof motion.span>

export function DialogTitle({ children, className, ...props }: DialogTitleProps) {
  const { uniqueId } = useDialog()

  return (
    <motion.span
      layout="position"
      layoutId={`dialog-title-container-${uniqueId}`}
      className={cn("", className)}
      {...props}>
      {children}
    </motion.span>
  )
}

export type DialogSubtitleProps = {
  children: React.ReactNode
} & React.ComponentProps<typeof motion.span>

export function DialogSubtitle({ children, className, ...props }: DialogSubtitleProps) {
  const { uniqueId } = useDialog()

  return (
    <motion.span layoutId={`dialog-subtitle-container-${uniqueId}`} className={cn("", className)} {...props}>
      {children}
    </motion.span>
  )
}

export type DialogDescriptionProps = {
  children: React.ReactNode
} & React.ComponentProps<typeof motion.p>

export function DialogDescription({ children, className, variants }: DialogDescriptionProps) {
  const { uniqueId } = useDialog()

  return (
    <motion.p
      id={`dialog-description-${uniqueId}`}
      layoutId={`dialog-description-content-${uniqueId}`}
      variants={variants}
      className={cn("", className)}
      initial="initial"
      animate="animate"
      exit="exit">
      {children}
    </motion.p>
  )
}

export type DialogImageProps = {
  src: string
  alt: string
} & React.ComponentProps<typeof motion.img>

export function DialogImage({ src, alt, className, ...props }: DialogImageProps) {
  const { uniqueId } = useDialog()
  return <motion.img layoutId={`dialog-img-${uniqueId}`} src={src} alt={alt} className={cn("", className)} {...props} />
}

export type DialogCloseProps = {} & ButtonProps

export function DialogClose({ children, className, ...props }: DialogCloseProps) {
  const { setIsOpen, uniqueId } = useDialog()
  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [setIsOpen])

  return (
    <Button
      key={`dialog-close-${uniqueId}`}
      variant={"ghost"}
      size={"md"}
      onClick={handleClose}
      className={cn("absolute top-6 right-6 rounded-full", className)}
      {...props}>
      {children ?? <X />}
    </Button>
  )
}
