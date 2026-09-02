"use client"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import type {
  ComponentProps,
  Dispatch,
  MouseEvent,
  PointerEvent,
  ReactElement,
  ReactNode,
  Ref,
  RefObject,
  SetStateAction
} from "react"
import {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState
} from "react"
import { type MorphPopoverOptions, type MorphPopoverRefs, useMorphPopover } from "./use-popover"

/* ---------------------------------------------------------------------------
 * Popover — a floating popover that morphs out of its own trigger using GSAP Flip.
 *
 * Implements the Compound Components pattern (Trigger, Content, Header, Title,
 * Description, Footer, Close, with `render` support for polymorphic composition).
 *
 * Utilizes design tokens and CSS variables from global.css and theme.css.
 * ------------------------------------------------------------------------- */

type PopoverContextValue = {
  open: boolean
  debug: boolean
  openPopover: () => void
  closePopover: () => void
  togglePopover: () => void
  refs: MorphPopoverRefs
  dismissHandlers: {
    onPointerDownCapture: (e: PointerEvent) => void
    onPointerUpCapture: (e: PointerEvent) => void
    onClick: () => void
  }
  titleId: string
  descriptionId: string
  hasTitle: boolean
  hasDescription: boolean
  setHasTitle: Dispatch<SetStateAction<boolean>>
  setHasDescription: Dispatch<SetStateAction<boolean>>
}

const PopoverContext = createContext<PopoverContextValue | null>(null)

export function usePopover() {
  const ctx = useContext(PopoverContext)
  if (!ctx) throw new Error("Popover compound components must be used inside <Popover>.")
  return ctx
}

export type PopoverProps = MorphPopoverOptions & {
  children?: ReactNode
  /** Controlled open state. Omit for uncontrolled. */
  open?: boolean
  /** Open on mount. Uncontrolled only. */
  defaultOpen?: boolean
}

function Popover({
  children,
  open: openProp,
  defaultOpen,
  onOpenChange,
  openDuration,
  closeDuration,
  side = "bottom",
  align = "center",
  sideOffset = 8,
  alignOffset = 0,
  collisionPadding = 12,
  dismissOnOutsideClick = true,
  dismissOnEscape = true,
  hideTrigger = true,
  modal = false,
  debug = false
}: PopoverProps) {
  const morph = useMorphPopover({
    openDuration,
    closeDuration,
    side,
    align,
    sideOffset,
    alignOffset,
    collisionPadding,
    dismissOnOutsideClick,
    dismissOnEscape,
    hideTrigger,
    modal,
    debug,
    onOpenChange
  })

  const mounted = useRef(false)
  const [hasTitle, setHasTitle] = useState(false)
  const [hasDescription, setHasDescription] = useState(false)
  const id = useId()

  useEffect(() => {
    if (openProp === undefined) return
    if (openProp) morph.open()
    else morph.close()
  }, [openProp, morph.open, morph.close])

  useEffect(() => {
    if (mounted.current) return
    mounted.current = true
    if (defaultOpen && openProp === undefined) morph.open()
  }, [defaultOpen, openProp, morph.open])

  const value = useMemo<PopoverContextValue>(
    () => ({
      open: morph.isOpen,
      debug: morph.debug,
      openPopover: morph.open,
      closePopover: morph.close,
      togglePopover: morph.toggle,
      refs: morph.refs,
      dismissHandlers: morph.dismissHandlers,
      titleId: `popover-title-${id}`,
      descriptionId: `popover-description-${id}`,
      hasTitle,
      hasDescription,
      setHasTitle,
      setHasDescription
    }),
    [
      morph.isOpen,
      morph.debug,
      morph.open,
      morph.close,
      morph.toggle,
      morph.refs,
      morph.dismissHandlers,
      id,
      hasTitle,
      hasDescription
    ]
  )

  return <PopoverContext value={value}>{children}</PopoverContext>
}

/* ----------------------------------------------------------------- helpers -- */

function mergeRefs<T>(...refs: (Ref<T> | undefined)[]) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue
      if (typeof ref === "function") ref(node)
      else (ref as RefObject<T | null>).current = node
    }
  }
}

function withRender(
  render: ReactElement,
  ours: Record<string, unknown>,
  className?: string,
  attach?: (el: never | null) => void,
  children?: ReactNode
) {
  const theirs = render.props as Record<string, unknown> & {
    ref?: Ref<never>
    className?: string
  }
  const merged: Record<string, unknown> = { ...ours }

  if (attach) merged.ref = mergeRefs(theirs.ref, attach)
  if (children !== undefined) merged.children = children

  for (const key of Object.keys(ours)) {
    const mine = ours[key]
    const yours = theirs[key]
    if (key.startsWith("on") && typeof mine === "function" && typeof yours === "function") {
      merged[key] = (...args: unknown[]) => {
        ;(yours as (...a: unknown[]) => void)(...args)
        ;(mine as (...a: unknown[]) => void)(...args)
      }
    }
  }
  merged.className = cn(theirs.className, className)

  return cloneElement(render, merged)
}

/* ----------------------------------------------------------------- trigger -- */

export type PopoverTriggerProps = ComponentProps<"button"> & {
  /** Render as a custom element, e.g. `render={<Button variant="outline" />}`. */
  render?: ReactElement
}

function PopoverTrigger({ render, className, onClick, children, ...props }: PopoverTriggerProps) {
  const ctx = usePopover()
  const { togglePopover, open } = ctx
  const { trigger: triggerRef, triggerHost: triggerHostRef } = ctx.refs

  const shared = {
    "data-slot": "popover-trigger",
    "aria-haspopup": "dialog" as const,
    "aria-expanded": open,
    "data-state": open ? "open" : "closed",
    onClick: (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event)
      if (!event.defaultPrevented) togglePopover()
    }
  }

  if (render) {
    const { onClick: openOnClick, ...attrs } = shared
    return (
      <span ref={triggerHostRef} className="contents" data-slot="popover-trigger-host" onClick={openOnClick}>
        {isValidElement(render) ? withRender(render, attrs, className, triggerRef as never, children) : render}
      </span>
    )
  }

  return (
    <button ref={triggerRef} type="button" className={className} {...shared} {...props}>
      {children}
    </button>
  )
}

/* ----------------------------------------------------------------- close -- */

export type PopoverCloseProps = ComponentProps<"button"> & {
  render?: ReactElement
}

function PopoverClose({ render, className, onClick, children, ...props }: PopoverCloseProps) {
  const { closePopover } = usePopover()

  const shared = {
    "data-slot": "popover-close",
    onClick: (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event)
      if (!event.defaultPrevented) closePopover()
    }
  }

  if (render) {
    const { onClick: closeOnClick, ...attrs } = shared
    return (
      <span className="contents" onClick={closeOnClick}>
        {isValidElement(render) ? withRender(render, attrs, className, undefined, children) : render}
      </span>
    )
  }

  return (
    <button type="button" className={className} {...shared} {...props}>
      {children}
    </button>
  )
}

/* ----------------------------------------------------------------- content -- */

export type PopoverContentProps = ComponentProps<"div"> & {
  /** Classes for the inner scrolling window */
  windowClassName?: string
  /** Classes for the backdrop element */
  backdropClassName?: string
  /** Whether to show the default close (X) button */
  showCloseButton?: boolean
}

function PopoverContent({
  className,
  windowClassName,
  backdropClassName,
  children,
  showCloseButton = true,
  ...props
}: PopoverContentProps) {
  const ctx = usePopover()
  const { dismissHandlers } = ctx
  const { popover: popoverRef, backdrop: backdropRef, surface: surfaceRef, window: windowRef } = ctx.refs

  if (!ctx.open) return null

  return (
    <div
      ref={popoverRef}
      data-slot="popover"
      data-state={ctx.open ? "open" : "closed"}
      data-debug={ctx.debug ? "true" : undefined}
      {...dismissHandlers}
      className={cn("fixed inset-0 z-50 overflow-visible pointer-events-none select-none", "outline-hidden")}>
      {/* Backdrop for outside click capture & subtle dimming */}
      <div
        ref={backdropRef}
        data-slot="popover-backdrop"
        className={cn(
          "pointer-events-auto fixed inset-0 z-0 bg-(--popover-backdrop) opacity-0",
          ctx.debug && "outline-1 outline-dashed outline-sky-400/60",
          backdropClassName
        )}
      />

      {/* Floating morphing surface */}
      <div
        ref={surfaceRef}
        role="dialog"
        aria-modal="false"
        aria-labelledby={ctx.hasTitle ? ctx.titleId : undefined}
        aria-describedby={ctx.hasDescription ? ctx.descriptionId : undefined}
        data-slot="popover-content"
        style={{ visibility: "hidden", ...props.style }}
        className={cn(
          "pointer-events-auto fixed z-1 box-border flex flex-col w-(--popover-width) max-h-(--popover-max-height)",
          "overflow-hidden rounded-(--popover-radius) bg-(--popover-surface) text-popover-foreground",
          "border border-outline/40 shadow-(--popover-shadow)",
          ctx.debug && "outline-2 outline-fuchsia-500/80",
          className
        )}
        {...props}>
        {/* Inner window */}
        <div
          ref={windowRef}
          data-slot="popover-window"
          className={cn(
            "flex min-h-0 flex-1 origin-center flex-col gap-(--popover-gap) overflow-auto overscroll-contain p-(--popover-padding) text-sm select-text",
            "rounded-(--popover-radius) bg-(--popover-surface)",
            ctx.debug && "outline-1 outline-emerald-400/80",
            windowClassName
          )}>
          {children}
          {showCloseButton && (
            <PopoverClose
              aria-label="Close"
              className="absolute top-3 right-3 inline-flex size-7 items-center justify-center rounded-full text-muted-foreground opacity-70 transition-all hover:opacity-100 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring after:absolute after:-inset-1.5 after:content-['']">
              <X className="size-4" />
            </PopoverClose>
          )}
        </div>
      </div>
    </div>
  )
}

export function PopoverHeader({ className, ...props }: ComponentProps<"header">) {
  return <header data-slot="popover-header" className={cn("flex flex-col gap-1 pr-6", className)} {...props} />
}

export function PopoverFooter({ className, ...props }: ComponentProps<"footer">) {
  return (
    <footer
      data-slot="popover-footer"
      className={cn("mt-auto flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2", className)}
      {...props}
    />
  )
}

export function PopoverTitle({ className, ...props }: ComponentProps<"h2">) {
  const { titleId, setHasTitle } = usePopover()
  useEffect(() => {
    setHasTitle(true)
    return () => setHasTitle(false)
  }, [setHasTitle])

  return (
    <h2
      id={titleId}
      data-slot="popover-title"
      className={cn("text-sm font-semibold leading-none tracking-tight text-foreground", className)}
      {...props}
    />
  )
}

export function PopoverDescription({ className, ...props }: ComponentProps<"p">) {
  const { descriptionId, setHasDescription } = usePopover()
  useEffect(() => {
    setHasDescription(true)
    return () => setHasDescription(false)
  }, [setHasDescription])

  return (
    <p
      id={descriptionId}
      data-slot="popover-description"
      className={cn("text-xs text-muted-foreground leading-relaxed", className)}
      {...props}
    />
  )
}

Popover.Trigger = PopoverTrigger
Popover.Header = PopoverHeader
Popover.Footer = PopoverFooter
Popover.Title = PopoverTitle
Popover.Description = PopoverDescription
Popover.Content = PopoverContent
Popover.Close = PopoverClose

export { Popover }
