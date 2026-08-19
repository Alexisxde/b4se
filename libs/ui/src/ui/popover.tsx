"use client"

import { X } from "lucide-react"
import React, {
  Children,
  cloneElement,
  createContext,
  type CSSProperties,
  type FC,
  type HTMLAttributes,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState
} from "react"
import { gsap } from "../lib/gsap"
import { cn } from "../lib/utils"

interface PopoverContextValue {
  id: string
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
  triggerRef: RefObject<HTMLElement | null>
  containerRef: RefObject<HTMLDivElement | null>
  backdropRef: RefObject<HTMLDivElement | null>
  contentRef: RefObject<HTMLDivElement | null>
  triggerId: string
  contentId: string
}

const PopoverContext = createContext<PopoverContextValue | null>(null)

function usePopover(component = "Popover subcomponent") {
  const ctx = useContext(PopoverContext)
  if (!ctx) {
    throw new Error(`<${component}> must be used inside <Popover>`)
  }
  return ctx
}

function getModalBounds(triggerEl: HTMLElement, maxWidth: number, height: number) {
  const triggerRect = triggerEl.getBoundingClientRect()
  const vw = window.innerWidth
  const vh = window.innerHeight
  const targetWidth = Math.min(vw - 32, maxWidth)

  let left = triggerRect.right - targetWidth
  if (left < 16) left = 16
  if (left + targetWidth > vw - 16) left = vw - targetWidth - 16

  let top = triggerRect.top
  if (top + height > vh - 20) top = Math.max(20, vh - height - 20)

  return { width: targetWidth, height, top, left }
}

interface PopoverProps {
  children: ReactNode
  maxWidth?: number
  height?: number
  onOpen?: () => void
  onClose?: () => void
}

type PopoverComponent = FC<PopoverProps> & {
  Trigger: typeof PopoverTrigger
  Content: typeof PopoverContent
  Close: typeof PopoverClose
}

const Popover: PopoverComponent = ({ children, maxWidth = 400, height = 520, onOpen, onClose }: PopoverProps) => {
  const id = useId()
  const [isOpen, setIsOpen] = useState(false)

  const triggerRef = useRef<HTMLElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const isAnimatingRef = useRef(false)

  const triggerId = `popover-trigger-${id}`
  const contentId = `popover-content-${id}`

  useEffect(() => {
    function handleResize() {
      if (!isOpen || isAnimatingRef.current) return
      if (!triggerRef.current || !containerRef.current) return
      const bounds = getModalBounds(triggerRef.current, maxWidth, height)
      gsap.set(containerRef.current, bounds)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isOpen, maxWidth, height])

  const open = useCallback(() => {
    if (isOpen || isAnimatingRef.current) return
    if (!triggerRef.current || !containerRef.current || !backdropRef.current || !contentRef.current) return

    isAnimatingRef.current = true

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const bounds = getModalBounds(triggerRef.current, maxWidth, height)
    const container = containerRef.current
    const backdrop = backdropRef.current
    const content = contentRef.current
    const contentChildren = Array.from(content.children) as HTMLElement[]

    gsap.set(container, {
      display: "block",
      top: triggerRect.top,
      left: triggerRect.left,
      width: triggerRect.width,
      height: triggerRect.height,
      borderRadius: "var(--radius-3xl)",
      opacity: 1,
      pointerEvents: "none"
    })

    gsap.set(triggerRef.current, { opacity: 0 })
    gsap.set(content, { opacity: 1 })
    gsap.set(contentChildren, { opacity: 0, y: 12 })

    gsap.set(backdrop, { display: "block", pointerEvents: "auto" })
    gsap.to(backdrop, { opacity: 1, duration: 0.6, ease: "power3.out" })

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(container, { pointerEvents: "auto" })
        isAnimatingRef.current = false
        setIsOpen(true)
        onOpen?.()
      }
    })

    tl.to(container, {
      top: bounds.top,
      left: bounds.left,
      width: bounds.width,
      height: bounds.height,
      borderRadius: "var(--radius-3xl)",
      duration: 0.5,
      ease: "expo.out"
    })

    tl.to(contentChildren, { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "power2.out" }, "-=0.45")
  }, [isOpen, maxWidth, height, onOpen])

  const close = useCallback(() => {
    if (!isOpen || isAnimatingRef.current) return
    if (!triggerRef.current || !containerRef.current || !backdropRef.current || !contentRef.current) return

    isAnimatingRef.current = true
    setIsOpen(false)

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const container = containerRef.current
    const backdrop = backdropRef.current
    const content = contentRef.current
    const contentChildren = Array.from(content.children) as HTMLElement[]
    const trigger = triggerRef.current

    gsap.set(container, { pointerEvents: "none" })

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(container, { display: "none" })
        gsap.set(backdrop, { display: "none", pointerEvents: "none", opacity: 0 })
        gsap.set(trigger, { opacity: 1 })
        isAnimatingRef.current = false
        onClose?.()
      }
    })

    tl.to(contentChildren, { opacity: 0, y: 8, duration: 0.2, ease: "power2.in" }, "-=0.1")
    tl.to(
      container,
      {
        top: triggerRect.top,
        left: triggerRect.left,
        width: triggerRect.width,
        height: triggerRect.height,
        borderRadius: "var(--radius-3xl)",
        duration: 0.5,
        ease: "expo.inOut"
      },
      "-=0.1"
    )

    tl.to(backdrop, { opacity: 0, duration: 0.2, ease: "power2.out" }, "-=0.4")
    tl.to(trigger, { opacity: 1, duration: 0.2, ease: "power2.out" }, "-=0.05")
  }, [isOpen, onClose])

  const toggle = useCallback(() => {
    if (isOpen) close()
    else open()
  }, [isOpen, open, close])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, close])

  return (
    <PopoverContext.Provider
      value={{
        id,
        isOpen,
        open,
        close,
        toggle,
        triggerRef,
        containerRef,
        backdropRef,
        contentRef,
        triggerId,
        contentId
      }}>
      {children}
    </PopoverContext.Provider>
  )
}

interface PopoverTriggerProps extends HTMLAttributes<HTMLElement> {
  children: ReactElement
  asChild?: boolean
}

function PopoverTrigger({ children, asChild = false, ...props }: PopoverTriggerProps) {
  const { isOpen, open, triggerRef, triggerId, contentId } = usePopover("PopoverTrigger")

  const child = asChild ? Children.only(children) : children

  if (!isValidElement(child)) return children

  const childProps = child.props as Record<string, unknown>

  return cloneElement(child as ReactElement<Record<string, unknown>>, {
    ...props,
    ...childProps,
    id: (childProps.id as string) || triggerId,
    ref: (node: HTMLElement | null) => {
      ;(triggerRef as React.MutableRefObject<HTMLElement | null>).current = node
      const existingRef = (child as unknown as { ref?: React.Ref<HTMLElement> }).ref
      if (typeof existingRef === "function") {
        existingRef(node)
      } else if (existingRef && typeof existingRef === "object") {
        ;(existingRef as React.MutableRefObject<HTMLElement | null>).current = node
      }
    },
    onClick: (e: React.MouseEvent) => {
      if (typeof childProps.onClick === "function") {
        childProps.onClick(e)
      }
      if (typeof props.onClick === "function") {
        props.onClick(e as unknown as React.MouseEvent<HTMLElement>)
      }
      if (!e.defaultPrevented) {
        open()
      }
    },
    "aria-expanded": isOpen,
    "aria-haspopup": "dialog",
    "aria-controls": contentId
  })
}

interface PopoverContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
  style?: CSSProperties
}

function PopoverContent({ children, className, style, ...props }: PopoverContentProps) {
  const { isOpen, close, containerRef, backdropRef, contentRef, contentId } = usePopover("PopoverContent")

  return (
    <>
      <div
        ref={backdropRef}
        onClick={close}
        aria-hidden="true"
        className="fixed inset-0 z-40 bg-background/50 backdrop-blur-xs"
        style={{ display: "none", opacity: 0, pointerEvents: "none" }}
      />

      <div
        ref={containerRef}
        id={contentId}
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
        className="fixed z-50 overflow-hidden bg-popover text-popover-foreground border border-outline shadow-2xl"
        style={{
          display: "none",
          willChange: "transform, width, height, border-radius"
        }}
        {...props}>
        <div ref={contentRef} className={cn("flex flex-col p-6", className)} style={style}>
          {children}
        </div>
      </div>
    </>
  )
}

interface PopoverCloseProps extends HTMLAttributes<HTMLElement> {
  children?: ReactElement
  className?: string
}

function PopoverClose({ children, className, ...props }: PopoverCloseProps) {
  const { close } = usePopover("PopoverClose")

  if (children && isValidElement(children)) {
    const childProps = children.props as Record<string, unknown>
    return cloneElement(children as ReactElement<Record<string, unknown>>, {
      ...props,
      ...childProps,
      className: cn((childProps.className as string) || "", className),
      onClick: (e: React.MouseEvent) => {
        if (typeof childProps.onClick === "function") {
          childProps.onClick(e)
        }
        if (typeof props.onClick === "function") {
          props.onClick(e as unknown as React.MouseEvent<HTMLElement>)
        }
        if (!e.defaultPrevented) {
          close()
        }
      }
    })
  }

  return (
    <button
      type="button"
      onClick={close}
      aria-label="Cerrar"
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground border border-outline/40 transition-colors cursor-pointer",
        className
      )}
      {...props}>
      <X className="size-4" />
    </button>
  )
}

Popover.Trigger = PopoverTrigger
Popover.Content = PopoverContent
Popover.Close = PopoverClose

export { Popover }
