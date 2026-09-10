"use client"
import { gsap } from "gsap"
import type { RefObject } from "react"
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react"

export const SIDE = { TOP: "top", BOTTOM: "bottom", LEFT: "left", RIGHT: "right" }
export const ALIGN = { START: "start", CENTER: "center", END: "end" }

export type Side = (typeof SIDE)[keyof typeof SIDE]
export type Align = (typeof ALIGN)[keyof typeof ALIGN]

export interface TooltipOptions {
  side?: Side
  align?: Align
  offset?: number
  collisionPadding?: number
  openDelay?: number
  closeDelay?: number
  duration?: number
  disabled?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export interface TooltipCoords {
  top: number
  left: number
}

export interface TooltipReturn {
  mounted: boolean
  open: boolean
  side: Side
  align: Align
  coords: TooltipCoords
  arrowCoords?: { x?: number; y?: number }
  triggerRef: RefObject<HTMLElement | null>
  contentRef: RefObject<HTMLDivElement | null>
  getTriggerProps: () => {
    "aria-describedby"?: string
    onPointerEnter: (e: PointerEvent) => void
    onPointerLeave: (e: PointerEvent) => void
    onFocus: () => void
    onBlur: () => void
  }
  contentId: string
  show: () => void
  hide: () => void
}

const OPPOSITE: Record<Side, number> = { top: 1, bottom: -1, left: 1, right: -1 }

export interface ComputeTooltipPositionOptions {
  side?: Side
  align?: Align
  offset?: number
  collisionPadding?: number
}

export interface ComputedTooltipPosition {
  top: number
  left: number
  actualSide: Side
  arrowCoords: { x?: number; y?: number }
}

const DEFAULT_OPTIONS = {
  SIDE: SIDE.TOP,
  ALIGN: ALIGN.CENTER,
  OFFSET: 8,
  COLLISION_PADDING: 8
}

export function computeTooltipPosition(
  trigger: HTMLElement,
  content: HTMLElement,
  options: ComputeTooltipPositionOptions = {}
): ComputedTooltipPosition {
  const preferredSide = options.side ?? DEFAULT_OPTIONS.SIDE
  const align = options.align ?? DEFAULT_OPTIONS.ALIGN
  const offset = options.offset ?? DEFAULT_OPTIONS.OFFSET
  const pad = options.collisionPadding ?? DEFAULT_OPTIONS.COLLISION_PADDING

  const t = trigger.getBoundingClientRect()
  const width = content.offsetWidth || content.getBoundingClientRect().width
  const height = content.offsetHeight || content.getBoundingClientRect().height

  const vw = typeof window !== "undefined" ? window.innerWidth : 1024
  const vh = typeof window !== "undefined" ? window.innerHeight : 768

  const spaceTop = t.top - offset - pad
  const spaceBottom = vh - t.bottom - offset - pad
  const spaceLeft = t.left - offset - pad
  const spaceRight = vw - t.right - offset - pad

  let actualSide = preferredSide as Side

  if (preferredSide === SIDE.TOP) {
    if (spaceTop < height && (spaceBottom >= height || spaceBottom > spaceTop)) actualSide = SIDE.BOTTOM
    else actualSide = SIDE.TOP
  }
  if (preferredSide === SIDE.BOTTOM) {
    if (spaceBottom < height && (spaceTop >= height || spaceTop > spaceBottom)) actualSide = SIDE.TOP
    else actualSide = SIDE.BOTTOM
  }
  if (preferredSide === SIDE.LEFT) {
    if (spaceLeft < width && (spaceRight >= width || spaceRight > spaceLeft)) actualSide = SIDE.RIGHT
    else actualSide = SIDE.LEFT
  }
  if (preferredSide === SIDE.RIGHT) {
    if (spaceRight < width && (spaceLeft >= width || spaceLeft > spaceRight)) actualSide = SIDE.LEFT
    else actualSide = SIDE.RIGHT
  }

  let top = 0
  let left = 0

  if (actualSide === SIDE.TOP) top = t.top - height - offset
  if (actualSide === SIDE.BOTTOM) top = t.bottom + offset
  if (actualSide === SIDE.LEFT) left = t.left - width - offset
  if (actualSide === SIDE.RIGHT) left = t.right + offset

  if (actualSide === SIDE.TOP || actualSide === SIDE.BOTTOM) {
    if (align === ALIGN.START) left = t.left
    if (align === ALIGN.CENTER) left = t.left + (t.width - width) / 2
    if (align === ALIGN.END) left = t.right - width
  }
  if (actualSide === SIDE.LEFT || actualSide === SIDE.RIGHT) {
    if (align === ALIGN.START) top = t.top
    if (align === ALIGN.CENTER) top = t.top + (t.height - height) / 2
    if (align === ALIGN.END) top = t.bottom - height
  }

  const clampedLeft = Math.max(pad, Math.min(vw - width - pad, left))
  const clampedTop = Math.max(pad, Math.min(vh - height - pad, top))

  const arrowCoords: { x?: number; y?: number } = {}
  const arrowPadding = 12

  if (actualSide === SIDE.TOP || actualSide === SIDE.BOTTOM) {
    const triggerCenterX = t.left + t.width / 2
    const rawArrowX = triggerCenterX - clampedLeft
    const minArrowX = Math.min(arrowPadding, width / 2)
    const maxArrowX = Math.max(minArrowX, width - arrowPadding)
    arrowCoords.x = Math.round(Math.max(minArrowX, Math.min(maxArrowX, rawArrowX)))
  } else {
    const triggerCenterY = t.top + t.height / 2
    const rawArrowY = triggerCenterY - clampedTop
    const minArrowY = Math.min(arrowPadding, height / 2)
    const maxArrowY = Math.max(minArrowY, height - arrowPadding)
    arrowCoords.y = Math.round(Math.max(minArrowY, Math.min(maxArrowY, rawArrowY)))
  }

  return {
    top: Math.round(clampedTop),
    left: Math.round(clampedLeft),
    actualSide,
    arrowCoords
  }
}

export function useTooltip(options: TooltipOptions = {}): TooltipReturn {
  const {
    side = SIDE.TOP,
    align = ALIGN.CENTER,
    offset = 8,
    collisionPadding = 8,
    openDelay = 120,
    closeDelay = 80,
    duration = 0.28,
    disabled = false,
    open: controlledOpen,
    onOpenChange
  } = options

  const isControlled = controlledOpen !== undefined
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const [mounted, setMounted] = useState(open)
  const [coords, setCoords] = useState<TooltipCoords>({ top: 0, left: 0 })
  const [actualSide, setActualSide] = useState<Side>(side)
  const [arrowCoords, setArrowCoords] = useState<{ x?: number; y?: number }>({})

  const triggerRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tweenRef = useRef<gsap.core.Tween | null>(null)
  const prevOpenRef = useRef(false)

  const reactId = useId()
  const contentId = `tooltip-${reactId}`

  const setOpen = useCallback(
    (next: boolean) => {
      if (next) setMounted(true)
      if (!isControlled) setUncontrolledOpen(next)
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange]
  )

  const clearTimers = useCallback(() => {
    if (openTimer.current) clearTimeout(openTimer.current)
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }, [])

  const show = useCallback(() => {
    if (disabled) return
    clearTimers()
    openTimer.current = setTimeout(() => setOpen(true), openDelay)
  }, [disabled, clearTimers, openDelay, setOpen])

  const hide = useCallback(() => {
    clearTimers()
    closeTimer.current = setTimeout(() => setOpen(false), closeDelay)
  }, [clearTimers, closeDelay, setOpen])

  useEffect(() => {
    if (open) setMounted(true)
  }, [open])

  // Compute the fixed-position coordinates from trigger + content rects with automatic flip & containment.
  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current
    const content = contentRef.current
    if (!trigger || !content) return

    const pos = computeTooltipPosition(trigger, content, {
      side,
      align,
      offset,
      collisionPadding
    })

    setCoords({ top: pos.top, left: pos.left })
    setActualSide(pos.actualSide)
    setArrowCoords(pos.arrowCoords)

    // Direct DOM styling for instant sync during scroll/resize
    content.style.top = `${pos.top}px`
    content.style.left = `${pos.left}px`
  }, [side, align, offset, collisionPadding])

  // Position + animate whenever mounted/open changes.
  useLayoutEffect(() => {
    if (!mounted) return
    updatePosition()
  }, [mounted, updatePosition])

  useEffect(() => {
    if (!mounted) return
    const content = contentRef.current
    if (!content) return

    const wasOpen = prevOpenRef.current
    prevOpenRef.current = open

    const axis = actualSide === SIDE.TOP || actualSide === SIDE.BOTTOM ? "y" : "x"
    const distance = 6 * OPPOSITE[actualSide]

    if (open) {
      if (!wasOpen) {
        tweenRef.current?.kill()
        tweenRef.current = gsap.fromTo(
          content,
          { autoAlpha: 0, scale: 0.94, [axis]: distance },
          { autoAlpha: 1, scale: 1, [axis]: 0, duration, ease: "back.out(1.7)" }
        )
      }
    } else {
      tweenRef.current?.kill()
      tweenRef.current = gsap.to(content, {
        autoAlpha: 0,
        scale: 0.94,
        [axis]: distance,
        duration: duration * 0.7,
        ease: "power2.in",
        onComplete: () => {
          setMounted(false)
          prevOpenRef.current = false
        }
      })
    }
    return () => {
      tweenRef.current?.kill()
    }
  }, [open, mounted, actualSide, duration])

  // Reposition on scroll / resize while open.
  useEffect(() => {
    if (!mounted) return
    const handler = () => updatePosition()
    window.addEventListener("scroll", handler, true)
    window.addEventListener("resize", handler)
    return () => {
      window.removeEventListener("scroll", handler, true)
      window.removeEventListener("resize", handler)
    }
  }, [mounted, updatePosition])

  // Close on Escape.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, setOpen])

  useEffect(() => clearTimers, [clearTimers])

  const getTriggerProps = useCallback(
    () => ({
      "aria-describedby": open ? contentId : undefined,
      onPointerEnter: (e: PointerEvent) => {
        if (e.pointerType !== "touch") show()
      },
      onPointerLeave: (e: PointerEvent) => {
        if (e.pointerType !== "touch") hide()
      },
      onFocus: show,
      onBlur: hide
    }),
    [open, contentId, show, hide]
  )

  return {
    mounted,
    open,
    side: actualSide,
    align,
    coords,
    arrowCoords,
    triggerRef,
    contentRef,
    getTriggerProps,
    contentId,
    show,
    hide
  }
}
