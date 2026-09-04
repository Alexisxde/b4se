"use client"
import * as React from "react"
import { EASE_BLUR, EASE_IN, EASE_OUT, ensureEases, ensurePlugins, Flip, gsap } from "../../lib/gsap"

export const SIDE = { TOP: "top", BOTTOM: "bottom", LEFT: "left", RIGHT: "right", INSET: "inset" }
export const ALIGN = { START: "start", CENTER: "center", END: "end" }

export type Side = (typeof SIDE)[keyof typeof SIDE]
export type Align = (typeof ALIGN)[keyof typeof ALIGN]

export type MorphPopoverOptions = {
  /** Seconds. The trigger → popover morph duration. */
  openDuration?: number
  /** Seconds. The popover → trigger morph duration. */
  closeDuration?: number
  /** Preferred floating side relative to trigger. */
  side?: Side
  /** Alignment on the cross axis. */
  align?: Align
  /** Distance in px between trigger and popover. */
  sideOffset?: number
  /** Offset in px along the alignment axis. */
  alignOffset?: number
  /** Viewport edge padding in px. */
  collisionPadding?: number
  /** Whether clicking outside the popover dismisses it. */
  dismissOnOutsideClick?: boolean
  /** Whether pressing Escape dismisses the popover. */
  dismissOnEscape?: boolean
  /**
   * Temporarily conceal the trigger while the popover is active,
   * creating the seamless effect of the trigger morphing directly into the floating card.
   */
  hideTrigger?: boolean
  /** Modal backdrop behavior. When true, locks scroll and renders backdrop. */
  modal?: boolean
  /** Enable debug logging and visual diagnostic outlines. */
  debug?: boolean
  /** Callback fired when the open state changes. */
  onOpenChange?: (open: boolean) => void
}

export type MorphPopoverNodes = {
  trigger: HTMLElement | null
  triggerHost: HTMLElement | null
  popover: HTMLDivElement | null
  backdrop: HTMLDivElement | null
  surface: HTMLDivElement | null
  window: HTMLDivElement | null
}

export type MorphPopoverRefs = {
  trigger: (el: HTMLElement | null) => void
  triggerHost: (el: HTMLElement | null) => void
  popover: (el: HTMLDivElement | null) => void
  backdrop: (el: HTMLDivElement | null) => void
  surface: (el: HTMLDivElement | null) => void
  window: (el: HTMLDivElement | null) => void
}

export interface FloatingRect {
  left: number
  top: number
  width: number
  height: number
  actualSide: Side
  actualAlign: Align
}

const DEFAULTS = {
  openDuration: 0.55,
  closeDuration: 0.35,
  side: SIDE.INSET,
  align: ALIGN.START,
  sideOffset: 16,
  alignOffset: 0,
  collisionPadding: 16,
  dismissOnOutsideClick: true,
  dismissOnEscape: true,
  hideTrigger: true,
  modal: false,
  debug: false
} satisfies Required<Omit<MorphPopoverOptions, "onOpenChange">>

function resolveOptions(o: MorphPopoverOptions) {
  return {
    openDuration: o.openDuration ?? DEFAULTS.openDuration,
    closeDuration: o.closeDuration ?? DEFAULTS.closeDuration,
    side: o.side ?? DEFAULTS.side,
    align: o.align ?? DEFAULTS.align,
    sideOffset: o.sideOffset ?? DEFAULTS.sideOffset,
    alignOffset: o.alignOffset ?? DEFAULTS.alignOffset,
    collisionPadding: o.collisionPadding ?? DEFAULTS.collisionPadding,
    dismissOnOutsideClick: o.dismissOnOutsideClick ?? DEFAULTS.dismissOnOutsideClick,
    dismissOnEscape: o.dismissOnEscape ?? DEFAULTS.dismissOnEscape,
    hideTrigger: o.hideTrigger ?? DEFAULTS.hideTrigger,
    modal: o.modal ?? DEFAULTS.modal,
    debug: o.debug ?? DEFAULTS.debug,
    onOpenChange: o.onOpenChange
  }
}

/**
 * Computes the optimal floating coordinates in viewport space
 * with automatic flip and collision detection.
 */
export function computeFloatingPosition(
  triggerEl: HTMLElement,
  surfaceEl: HTMLElement,
  options: {
    side?: Side
    align?: Align
    sideOffset?: number
    alignOffset?: number
    collisionPadding?: number
  } = {}
): FloatingRect {
  const side = options.side ?? DEFAULTS.side
  const align = options.align ?? DEFAULTS.align
  const sideOffset = options.sideOffset ?? DEFAULTS.sideOffset
  const alignOffset = options.alignOffset ?? DEFAULTS.alignOffset
  const pad = options.collisionPadding ?? DEFAULTS.collisionPadding

  const tRect = triggerEl.getBoundingClientRect()
  const sRect = surfaceEl.getBoundingClientRect()

  const vw = typeof window !== "undefined" ? window.innerWidth : 1024
  const vh = typeof window !== "undefined" ? window.innerHeight : 768

  const width = Math.min(sRect.width || 320, vw - pad * 2)
  const height = Math.min(sRect.height || 220, vh - pad * 2)

  let actualSide = side
  const actualAlign = align

  if (side === SIDE.TOP) {
    const spaceTop = tRect.top - sideOffset - pad
    const spaceBottom = vh - tRect.bottom - sideOffset - pad
    if (spaceTop < height && spaceBottom > spaceTop) actualSide = SIDE.BOTTOM
  }
  if (side === SIDE.LEFT) {
    const spaceLeft = tRect.left - sideOffset - pad
    const spaceRight = vw - tRect.right - sideOffset - pad
    if (spaceLeft < width && spaceRight > spaceLeft) actualSide = SIDE.RIGHT
  }
  if (side === SIDE.INSET) actualSide = SIDE.INSET
  if (side === SIDE.RIGHT) {
    const spaceRight = vw - tRect.right - sideOffset - pad
    const spaceLeft = tRect.left - sideOffset - pad
    if (spaceRight < width && spaceLeft > spaceRight) actualSide = SIDE.LEFT
  }
  if (side === SIDE.BOTTOM) {
    const spaceBottom = vh - tRect.bottom - sideOffset - pad
    const spaceTop = tRect.top - sideOffset - pad
    if (spaceBottom < height && spaceTop > spaceBottom) actualSide = SIDE.TOP
  }

  let top = 0
  let left = 0

  if (actualSide === SIDE.TOP) top = tRect.top - sideOffset - height
  if (actualSide === SIDE.BOTTOM) top = tRect.bottom + sideOffset
  if (actualSide === SIDE.LEFT) left = tRect.left - sideOffset - width
  if (actualSide === SIDE.RIGHT) left = tRect.right + sideOffset
  if (actualSide === SIDE.INSET) top = tRect.top + (tRect.height - height) / 2 + sideOffset

  if (actualSide === SIDE.TOP || actualSide === SIDE.BOTTOM) {
    if (actualAlign === ALIGN.START) left = tRect.left + alignOffset
    if (actualAlign === ALIGN.CENTER) left = tRect.left + (tRect.width - width) / 2 + alignOffset
    if (actualAlign === ALIGN.END) left = tRect.right - width - alignOffset
    if (left + width > vw - pad) left = Math.max(pad, vw - pad - width)
    if (left < pad) left = pad
    top = Math.max(pad, Math.min(vh - pad - height, top))
  }
  if (actualSide === SIDE.INSET) {
    if (actualAlign === ALIGN.START) left = tRect.left - tRect.width - width / 2 + alignOffset
    if (actualAlign === ALIGN.CENTER) left = tRect.left + (tRect.width - width) / 2 + alignOffset
    if (actualAlign === ALIGN.END) left = tRect.left - tRect.width + width / 2 + alignOffset
    if (left + width > vw - pad) left = Math.max(pad, vw - pad - width)
    if (left < pad) left = pad
    top = Math.max(pad, Math.min(vh - pad - height, top))
  }
  if (actualSide === SIDE.LEFT || actualSide === SIDE.RIGHT) {
    if (actualAlign === ALIGN.START) top = tRect.top + alignOffset
    if (actualAlign === ALIGN.CENTER) top = tRect.top + (tRect.height - height) / 2 + alignOffset
    if (actualAlign === ALIGN.END) top = tRect.bottom - height - alignOffset
    if (top + height > vh - pad) top = Math.max(pad, vh - pad - height)
    if (top < pad) top = pad
    left = Math.max(pad, Math.min(vw - pad - width, left))
  }

  return {
    left: Math.round(left),
    top: Math.round(top),
    width: Math.round(width),
    height: Math.round(height),
    actualSide,
    actualAlign
  }
}

function radiusOf(cs: CSSStyleDeclaration, width: number, height: number) {
  const short = Math.min(width, height)
  const half = short / 2
  const raw = cs.borderTopLeftRadius
  const value = parseFloat(raw)
  if (!Number.isFinite(value)) return { px: half, round: true }
  const px = raw.endsWith("%") ? (short * value) / 100 : value
  return { px: Math.min(px, half), round: px >= half - 0.5 }
}

export function useMorphPopover(options: MorphPopoverOptions = {}) {
  const optsRef = React.useRef(resolveOptions(options))
  optsRef.current = resolveOptions(options)

  const [isOpen, setIsOpen] = React.useState(false)
  const flipId = React.useId()

  const nodes = React.useRef<MorphPopoverNodes>({
    trigger: null,
    triggerHost: null,
    popover: null,
    backdrop: null,
    surface: null,
    window: null
  })

  const setTrigger = React.useCallback((el: HTMLElement | null) => {
    nodes.current.trigger = el
  }, [])
  const setTriggerHost = React.useCallback((el: HTMLElement | null) => {
    nodes.current.triggerHost = el
  }, [])
  const setPopover = React.useCallback((el: HTMLDivElement | null) => {
    nodes.current.popover = el
  }, [])
  const setBackdrop = React.useCallback((el: HTMLDivElement | null) => {
    nodes.current.backdrop = el
  }, [])
  const setSurface = React.useCallback((el: HTMLDivElement | null) => {
    nodes.current.surface = el
  }, [])
  const setWindow = React.useCallback((el: HTMLDivElement | null) => {
    nodes.current.window = el
  }, [])

  const refs = React.useMemo<MorphPopoverRefs>(
    () => ({
      trigger: setTrigger,
      triggerHost: setTriggerHost,
      popover: setPopover,
      backdrop: setBackdrop,
      surface: setSurface,
      window: setWindow
    }),
    [setTrigger, setTriggerHost, setPopover, setBackdrop, setSurface, setWindow]
  )

  const reducedRef = React.useRef(false)
  React.useEffect(() => {
    const mm = gsap.matchMedia()
    mm.add("(prefers-reduced-motion: reduce)", () => {
      reducedRef.current = true
      return () => {
        reducedRef.current = false
      }
    })
    return () => mm.revert()
  }, [])

  const tlRef = React.useRef<gsap.core.Timeline | null>(null)
  const closeTlRef = React.useRef<gsap.core.Timeline | null>(null)
  const closingRef = React.useRef(false)
  const pendingOpenRef = React.useRef(false)
  const frozenRef = React.useRef<{ w: number; h: number } | null>(null)
  const shapeRef = React.useRef<{ round: boolean; target: number } | null>(null)
  const kRefRef = React.useRef(1)
  const settledRef = React.useRef(false)
  const lastFloatingRef = React.useRef<FloatingRect | null>(null)

  const hiddenTriggerRef = React.useRef<{
    el: HTMLElement
    visibility: string
    transitionProperty: string
  } | null>(null)

  const concealTrigger = React.useCallback((el: HTMLElement | null) => {
    if (!el || hiddenTriggerRef.current) return
    hiddenTriggerRef.current = {
      el,
      visibility: el.style.visibility,
      transitionProperty: el.style.transitionProperty
    }
    el.style.transitionProperty = "none"
    el.style.visibility = "hidden"
  }, [])

  const revealTrigger = React.useCallback(() => {
    const hidden = hiddenTriggerRef.current
    if (!hidden) return
    hiddenTriggerRef.current = null
    hidden.el.style.visibility = hidden.visibility
    hidden.el.getBoundingClientRect()
    hidden.el.style.transitionProperty = hidden.transitionProperty
  }, [])

  React.useEffect(() => {
    return () => {
      tlRef.current?.kill()
      closeTlRef.current?.kill()
      revealTrigger()
    }
  }, [revealTrigger])

  const getTrigger = React.useCallback((): HTMLElement | null => {
    const { trigger, triggerHost } = nodes.current
    return trigger ?? (triggerHost?.firstElementChild as HTMLElement | null) ?? null
  }, [])

  const freezeChild = React.useCallback((size?: { w: number; h: number }) => {
    const surface = nodes.current.surface
    const win = nodes.current.window
    if (!surface || !win) return
    if (size) frozenRef.current = size
    else {
      const r = surface.getBoundingClientRect()
      frozenRef.current = { w: r.width, h: r.height }
    }
    const { w, h } = frozenRef.current
    gsap.set(win, {
      width: w,
      height: h,
      minWidth: w,
      minHeight: h,
      maxHeight: h,
      position: "absolute",
      left: "50%",
      top: "50%",
      xPercent: -50,
      yPercent: -50
    })
  }, [])

  const thawChild = React.useCallback(() => {
    const win = nodes.current.window
    if (!win) return
    gsap.set(win, {
      clearProps: "minWidth,minHeight,maxHeight,width,height,position,left,top,xPercent,yPercent,scale,opacity,filter"
    })
  }, [])

  const fitFrame = React.useCallback(() => {
    const surface = nodes.current.surface
    const win = nodes.current.window
    const f = frozenRef.current
    if (!surface || !win || !f) return
    const s = surface.getBoundingClientRect()
    if (!s.width || !s.height) return

    const k = Math.min(s.width / f.w, s.height / f.h)
    const coverage = Math.min((f.w * k) / s.width, (f.h * k) / s.height)
    const fit = gsap.utils.clamp(0, 1, (coverage - 0.7) / 0.3)
    const kn = k / (kRefRef.current || 1)
    const room = gsap.utils.clamp(0, 1, (kn - 0.3) / 0.45)
    const opacity = fit * room
    gsap.set(win, { scale: k, opacity })

    const shape = shapeRef.current
    if (shape?.round) {
      const half = Math.min(s.width, s.height) / 2
      const t = gsap.utils.clamp(0, 1, (kn - 0.2) / 0.5)
      const eased = t * t * (3 - 2 * t)
      const radius = Math.min(half, half + (shape.target - half) * eased)
      gsap.set(surface, { borderRadius: radius })
    }
  }, [])

  const settle = React.useCallback(() => {
    const surface = nodes.current.surface
    if (!surface) return
    thawChild()
    const fl = lastFloatingRef.current
    gsap.set(surface, {
      clearProps: "margin,transform,transformOrigin,scale,opacity,backgroundColor",
      position: "fixed",
      left: fl ? `${fl.left}px` : surface.style.left,
      top: fl ? `${fl.top}px` : surface.style.top,
      width: fl ? `${fl.width}px` : surface.style.width,
      height: fl ? `${fl.height}px` : surface.style.height
    })
    settledRef.current = true
  }, [thawChild])

  const build = React.useCallback(() => {
    const trigger = getTrigger()
    const popover = nodes.current.popover
    const backdrop = nodes.current.backdrop
    const surface = nodes.current.surface
    const win = nodes.current.window
    if (!popover || !surface || !win) return null

    ensurePlugins()
    ensureEases()

    tlRef.current?.kill()
    gsap.set([surface, win, backdrop].filter(Boolean), {
      clearProps: "all",
      display: "",
      visibility: "visible",
      opacity: 1
    })
    kRefRef.current = 1
    settledRef.current = false

    const o = optsRef.current
    const OPEN = reducedRef.current ? 0.001 : o.openDuration
    const sCS = getComputedStyle(surface)
    const surfaceBg = sCS.backgroundColor
    const surfaceRadius = sCS.borderRadius

    if (!trigger) {
      // Headless/fallback opening without trigger
      shapeRef.current = null
      freezeChild()
      const tl = gsap.timeline({ paused: true, onComplete: settle })
      tl.fromTo(
        surface,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: OPEN * 0.5, ease: "power2.out" },
        0
      )
      if (backdrop) {
        tl.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.15, ease: "none" }, 0)
      }
      tl.eventCallback("onUpdate", () => fitFrame())
      tlRef.current = tl.progress(1, true).progress(0, true)
      fitFrame()
      return tlRef.current
    }

    trigger.dataset.flipId = flipId
    surface.dataset.flipId = flipId

    const tCS = getComputedStyle(trigger)
    const originState = Flip.getState(trigger)

    if (o.hideTrigger) concealTrigger(trigger)

    // Compute floating target geometry relative to the trigger
    const floating = computeFloatingPosition(trigger, surface, {
      side: o.side,
      align: o.align,
      sideOffset: o.sideOffset,
      alignOffset: o.alignOffset,
      collisionPadding: o.collisionPadding
    })
    lastFloatingRef.current = floating

    gsap.set(surface, {
      position: "fixed",
      margin: 0,
      left: floating.left,
      top: floating.top,
      width: floating.width,
      height: floating.height
    })

    freezeChild({ w: floating.width, h: floating.height })

    const tl = gsap.timeline({ paused: true, onComplete: settle })

    tl.add(
      Flip.from(originState, {
        targets: surface,
        duration: OPEN,
        ease: EASE_IN,
        scale: false
      }),
      0
    )

    const triggerBox = trigger.getBoundingClientRect()
    const origin = radiusOf(tCS, triggerBox.width, triggerBox.height)
    const resting = frozenRef.current ?? { w: floating.width, h: floating.height }
    const target = radiusOf(sCS, resting.w, resting.h)
    shapeRef.current = { round: origin.round, target: target.px }

    gsap.set(surface, {
      backgroundColor: tCS.backgroundColor,
      ...(origin.round ? {} : { borderRadius: tCS.borderRadius })
    })

    tl.to(
      surface,
      {
        backgroundColor: surfaceBg,
        ...(origin.round ? {} : { borderRadius: surfaceRadius }),
        duration: OPEN * 0.22,
        ease: "power2.out"
      },
      OPEN * 0.02
    )

    tl.eventCallback("onUpdate", () => fitFrame())
    tl.fromTo(
      win,
      { filter: "blur(8px)" },
      {
        filter: "blur(0px)",
        duration: reducedRef.current ? 0.001 : OPEN * 0.72,
        ease: EASE_BLUR
      },
      0
    )

    if (backdrop) {
      tl.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.15, ease: "none" }, 0)
    }

    tlRef.current = tl.progress(1, true).progress(0, true)
    fitFrame()
    return tlRef.current
  }, [flipId, freezeChild, fitFrame, getTrigger, settle, concealTrigger])

  const open = React.useCallback(() => {
    if (isOpen || closingRef.current) {
      if (closingRef.current) pendingOpenRef.current = true
      return
    }
    setIsOpen(true)
    optsRef.current.onOpenChange?.(true)
  }, [isOpen])

  // Run build and play when isOpen becomes true and DOM is ready
  React.useEffect(() => {
    if (!isOpen) return
    const surface = nodes.current.surface
    if (!surface) return
    const tl = build()
    tl?.play()
  }, [isOpen, build])

  const close = React.useCallback(() => {
    const trigger = getTrigger()
    const backdrop = nodes.current.backdrop
    const surface = nodes.current.surface
    const win = nodes.current.window
    if (!isOpen || closingRef.current) return
    if (!surface || !win) {
      setIsOpen(false)
      optsRef.current.onOpenChange?.(false)
      return
    }

    closingRef.current = true
    tlRef.current?.pause()

    const resting = settledRef.current ? { w: surface.offsetWidth, h: surface.offsetHeight } : null
    if (resting) freezeChild(resting)

    const baked = surface.getBoundingClientRect()
    const frozen = frozenRef.current
    kRefRef.current = frozen ? Math.min(baked.width / frozen.w, baked.height / frozen.h) : 1
    fitFrame()

    const o = optsRef.current
    const D = reducedRef.current ? 0.001 : o.closeDuration

    const home = () => {
      if (trigger) delete trigger.dataset.flipId
      delete surface.dataset.flipId
      thawChild()
      gsap.set([surface, win, backdrop].filter(Boolean), { clearProps: "all" })
      // Explicitly hide DOM nodes synchronously so no flash can occur before React unmounts
      if (nodes.current.popover) {
        nodes.current.popover.style.display = "none"
        nodes.current.popover.style.visibility = "hidden"
      }
      if (surface) {
        surface.style.display = "none"
        surface.style.visibility = "hidden"
      }
      if (backdrop) {
        backdrop.style.display = "none"
        backdrop.style.visibility = "hidden"
      }
      revealTrigger()
      trigger?.focus({ preventScroll: true })
      closingRef.current = false
      settledRef.current = false
      closeTlRef.current = null
      kRefRef.current = 1
      setIsOpen(false)
      o.onOpenChange?.(false)
      if (pendingOpenRef.current) {
        pendingOpenRef.current = false
        open()
      }
    }

    const tl = gsap.timeline({ onComplete: home })
    closeTlRef.current = tl

    if (!trigger) {
      tl.to(surface, { scale: 0.9, opacity: 0, duration: D, ease: "power2.in" }, 0)
      if (backdrop) tl.to(backdrop, { opacity: 0, duration: D, ease: "power1.in" }, 0)
      return
    }

    const tCS = getComputedStyle(trigger)
    const triggerBox = trigger.getBoundingClientRect()
    const origin = radiusOf(tCS, triggerBox.width, triggerBox.height)
    shapeRef.current = {
      round: origin.round,
      target:
        shapeRef.current?.target ??
        radiusOf(getComputedStyle(surface), frozenRef.current?.w ?? 0, frozenRef.current?.h ?? 0).px
    }

    tl.add(
      Flip.to(Flip.getState(trigger), {
        targets: surface,
        duration: D,
        ease: EASE_OUT,
        scale: false
      }),
      0
    )

    tl.to(
      surface,
      {
        backgroundColor: tCS.backgroundColor,
        ...(origin.round ? {} : { borderRadius: tCS.borderRadius }),
        duration: D * 0.45,
        ease: "power1.in"
      },
      D * 0.55
    )

    tl.eventCallback("onUpdate", () => fitFrame())
    if (backdrop) tl.to(backdrop, { opacity: 0, duration: 0.2, ease: "power1.in" }, D * 0.6)
  }, [isOpen, freezeChild, thawChild, fitFrame, getTrigger, open, revealTrigger])

  const toggle = React.useCallback(() => {
    if (isOpen) close()
    else open()
  }, [isOpen, open, close])

  // Escape key handler
  React.useEffect(() => {
    if (!isOpen || !optsRef.current.dismissOnEscape) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        close()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [isOpen, close])

  // Outside click handler
  const isOutside = React.useCallback(
    (target: EventTarget | null) => {
      const surface = nodes.current.surface
      const trigger = getTrigger()
      if (!surface || !(target instanceof Node)) return false
      if (surface.contains(target)) return false
      if (trigger?.contains(target)) return false
      return true
    },
    [getTrigger]
  )

  const outsideDownRef = React.useRef(false)
  const outsideUpRef = React.useRef(false)

  const dismissHandlers = React.useMemo(
    () => ({
      onPointerDownCapture: (e: React.PointerEvent) => {
        outsideDownRef.current = isOutside(e.target)
        outsideUpRef.current = false
      },
      onPointerUpCapture: (e: React.PointerEvent) => {
        outsideUpRef.current = isOutside(e.target)
      },
      onClick: () => {
        const both = outsideDownRef.current && outsideUpRef.current
        outsideDownRef.current = false
        outsideUpRef.current = false
        if (!both || !optsRef.current.dismissOnOutsideClick) return
        close()
      }
    }),
    [close, isOutside]
  )

  // Reposition on window resize / scroll when open
  React.useEffect(() => {
    if (!isOpen) return
    const updatePosition = () => {
      const trigger = getTrigger()
      const surface = nodes.current.surface
      if (!trigger || !surface || closingRef.current || !settledRef.current) return
      const floating = computeFloatingPosition(trigger, surface, {
        side: optsRef.current.side,
        align: optsRef.current.align,
        sideOffset: optsRef.current.sideOffset,
        alignOffset: optsRef.current.alignOffset,
        collisionPadding: optsRef.current.collisionPadding
      })
      lastFloatingRef.current = floating
      gsap.set(surface, {
        left: `${floating.left}px`,
        top: `${floating.top}px`
      })
    }

    window.addEventListener("resize", updatePosition, { passive: true })
    window.addEventListener("scroll", updatePosition, { passive: true, capture: true })
    return () => {
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition, true)
    }
  }, [isOpen, getTrigger])

  return {
    isOpen,
    open,
    close,
    toggle,
    debug: optsRef.current.debug,
    refs,
    dismissHandlers
  }
}
