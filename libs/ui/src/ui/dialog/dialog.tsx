"use client"
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
import { cn } from "../../lib/utils"
import { useMorphDialog, type MorphDialogOptions, type MorphDialogRefs } from "./use-dialog"

/* ---------------------------------------------------------------------------
 * dialog — a native <dialog> that morphs out of its own trigger.
 *
 * The API mirrors shadcn/ui's Dialog (Trigger / Content / Header / Title /
 * Description / Footer / Close, `render` for composition) so it drops into an
 * existing Dialog call site. Nothing inside imports from components/ui: the
 * children you pass are the only opinion about how it looks.
 *
 * Everything visual is a CSS variable — see the `cssVars` in registry.json.
 * ------------------------------------------------------------------------- */

type DialogContextValue = {
  open: boolean
  debug: boolean
  fullscreen: boolean
  openDialog: () => void
  closeDialog: () => void
  refs: MorphDialogRefs
  dismissHandlers: {
    onPointerDownCapture: (e: PointerEvent) => void
    onPointerUpCapture: (e: PointerEvent) => void
    onClick: () => void
  }
  dragHandlers: {
    onPointerDown: (e: PointerEvent<HTMLElement>) => void
    onPointerMove: (e: PointerEvent<HTMLElement>) => void
    onPointerUp: (e: PointerEvent<HTMLElement>) => void
    onPointerCancel: (e: PointerEvent<HTMLElement>) => void
  }
  titleId: string
  descriptionId: string
  hasTitle: boolean
  hasDescription: boolean
  setHasTitle: Dispatch<SetStateAction<boolean>>
  setHasDescription: Dispatch<SetStateAction<boolean>>
}

const DialogContext = createContext<DialogContextValue | null>(null)

function useDialog() {
  const ctx = useContext(DialogContext)
  if (!ctx) throw new Error("Dialog components must be used inside <Dialog>.")
  return ctx
}

export type DialogProps = MorphDialogOptions & {
  children?: ReactNode
  /** Controlled open state. Omit for uncontrolled. */
  open?: boolean
  /** Open on mount. Uncontrolled only. */
  defaultOpen?: boolean
}

function Dialog({
  children,
  open: openProp,
  defaultOpen,
  onOpenChange,
  openDuration,
  closeDuration,
  dismissDistance,
  dismissSpeed,
  dragFalloff,
  draggable,
  hideTrigger,
  fullscreen,
  debug
}: DialogProps) {
  const morph = useMorphDialog({
    openDuration,
    closeDuration,
    dismissDistance,
    dismissSpeed,
    dragFalloff,
    draggable,
    hideTrigger,
    fullscreen,
    debug,
    onOpenChange
  })
  const mounted = useRef(false)
  const [hasTitle, setHasTitle] = useState(false)
  const [hasDescription, setHasDescription] = useState(false)
  const id = useId()

  /* The morph is imperative — it measures live geometry and owns the <dialog>'s
     showModal/close. So a controlled `open` drives those calls rather than
     rendering a different tree. */
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

  const value = useMemo<DialogContextValue>(
    () => ({
      open: morph.isOpen,
      debug: morph.debug,
      fullscreen: morph.fullscreen,
      openDialog: morph.open,
      closeDialog: morph.close,
      refs: morph.refs,
      dismissHandlers: morph.dismissHandlers,
      dragHandlers: morph.dragHandlers,
      titleId: `dialog-title-${id}`,
      descriptionId: `dialog-description-${id}`,
      hasTitle,
      hasDescription,
      setHasTitle,
      setHasDescription
    }),
    [
      morph.isOpen,
      morph.debug,
      morph.fullscreen,
      morph.open,
      morph.close,
      morph.refs,
      morph.dismissHandlers,
      morph.dragHandlers,
      id,
      hasTitle,
      hasDescription
    ]
  )

  return <DialogContext value={value}>{children}</DialogContext>
}

/* ----------------------------------------------------------------- compose -- */

function mergeRefs<T>(...refs: (Ref<T> | undefined)[]) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue
      if (typeof ref === "function") ref(node)
      else (ref as RefObject<T | null>).current = node
    }
  }
}

/**
 * Clone `render` with our props, keeping whatever it already declared. The ref is
 * a separate argument rather than a key in `ours`: react-hooks/refs objects to a
 * ref travelling inside a plain object into a function call.
 */
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
  /* Children passed to the part rather than to the render element win, so both
     `render={<Button>Open</Button>}` and `render={<Button />}>Open<` work. */
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

export type DialogTriggerProps = ComponentProps<"button"> & {
  /** Render as your own element, e.g. `render={<Button variant="outline" />}`. */
  render?: ReactElement
}

function DialogTrigger({ render, className, onClick, children, ...props }: DialogTriggerProps) {
  const ctx = useDialog()
  const { openDialog, open } = ctx
  /* Destructured, not read inline: react-hooks/refs follows ref-ness through a
     member expression but not through destructuring. */
  const { trigger: triggerRef, triggerHost: triggerHostRef } = ctx.refs

  /* The trigger is the origin of the morph: Flip records this element's live
     geometry, colour and radius, so it has to be the real DOM node. */
  const shared = {
    "data-slot": "dialog-trigger",
    "aria-haspopup": "dialog" as const,
    /* deliberately no aria-expanded: it is not the right state for a modal, and
       shadcn's Button styles aria-expanded triggers with a different background
       — which Flip would then read as the origin colour on the way out. */
    "data-state": open ? "open" : "closed",
    onClick: (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event)
      if (!event.defaultPrevented) openDialog()
    }
  }

  if (render) {
    /* A `render` element is always wrapped in a display:contents span — no box of
       its own, so it changes nothing about layout, and the click bubbles up to
       it. The wrapper is what makes this work with elements created in a Server
       Component: those cross the RSC boundary as lazy references whose props
       cannot be read, so they cannot be cloned. When the element IS clonable we
       still clone it, to put the slot attributes and the ref on the real button
       — but the structure stays the same either way, so server and client never
       disagree during hydration. */
    const { onClick: openOnClick, ...attrs } = shared
    return (
      <span ref={triggerHostRef} className="contents" data-slot="dialog-trigger-host" onClick={openOnClick}>
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

export type DialogCloseProps = ComponentProps<"button"> & {
  render?: ReactElement
}

function DialogClose({ render, className, onClick, children, ...props }: DialogCloseProps) {
  const { closeDialog } = useDialog()

  const shared = {
    "data-slot": "dialog-close",
    onClick: (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event)
      if (!event.defaultPrevented) closeDialog()
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

export type DialogContentProps = ComponentProps<"div"> & {
  /** Classes for the scrolling content box inside the morphing surface. */
  windowClassName?: string
  /** Classes for the backdrop element. */
  backdropClassName?: string
  showCloseButton?: boolean
}

function DialogContent({
  className,
  windowClassName,
  backdropClassName,
  children,
  showCloseButton = true,
  ...props
}: DialogContentProps) {
  const ctx = useDialog()
  const { closeDialog, dragHandlers, dismissHandlers } = ctx
  /* Destructured, not read inline: react-hooks/refs rejects a member expression
     in a ref attribute. */
  const { dialog: dialogRef, backdrop: backdropRef, drag: dragElRef, surface: surfaceRef, window: windowRef } = ctx.refs

  return (
    <dialog
      ref={dialogRef}
      data-slot="dialog"
      data-state={ctx.open ? "open" : "closed"}
      data-debug={ctx.debug ? "true" : undefined}
      data-fullscreen={ctx.fullscreen ? "true" : undefined}
      aria-labelledby={ctx.hasTitle ? ctx.titleId : undefined}
      aria-describedby={ctx.hasDescription ? ctx.descriptionId : undefined}
      onCancel={(event) => {
        // Escape: cancel the browser's instant close and morph home instead.
        event.preventDefault()
        closeDialog()
      }}
      /* Both halves of the outside click live on the <dialog>, because every
         layer that counts as "outside" is a descendant of it. */
      {...dismissHandlers}
      className={cn(
        "fixed inset-0 m-0 h-dvh max-h-dvh w-screen max-w-[100vw] overflow-visible border-0 bg-transparent p-0 text-inherit",
        // the real backdrop is the element below: ::backdrop cannot be reached
        // from JS, and its opacity has to track the drag frame by frame
        "backdrop:bg-transparent",
        /* showModal() focuses the <dialog> itself, and WebKit counts that as
           :focus-visible where Chromium does not — a UA focus ring around an
           element the size of the viewport. The ring belongs on the controls
           inside, not on the container. */
        "outline-hidden"
      )}>
      <div
        ref={backdropRef}
        data-slot="dialog-backdrop"
        className={cn(
          "pointer-events-none absolute inset-0 z-0 bg-(--dialog-backdrop) opacity-0",
          ctx.debug && "outline-1 outline-dashed outline-sky-400/60",
          backdropClassName
        )}
      />

      {/* carries the drag transform, so the gesture and Flip never write to the
          same properties on the same element */}
      <div
        ref={dragElRef}
        data-slot="dialog-drag"
        className={cn(
          "absolute inset-0 grid place-items-center",
          ctx.debug && "outline-1 outline-dashed outline-amber-400/60"
        )}>
        {/* the growing box — real width/height, so its radius stays a radius */}
        <div
          ref={surfaceRef}
          data-slot="dialog-content"
          data-fullscreen={ctx.fullscreen ? "true" : undefined}
          {...dragHandlers}
          className={cn(
            /* A flex column so the window below can shrink: capped by max-height,
               the surface's auto height still measures the content exactly, and
               anything taller than the cap scrolls inside instead of being
               clipped out of reach. */
            "relative z-1 box-border flex flex-col w-(--dialog-width) max-h-(--dialog-max-height)",
            /* No will-change here: this box animates width, height, left and top,
               none of which a compositor hint helps. The drag wrapper is what
               transforms, and it advertises that for the length of the gesture. */
            "cursor-grab touch-none overflow-hidden active:cursor-grabbing motion-reduce:cursor-default",
            "rounded-(--dialog-radius) bg-(--dialog-surface) text-(--dialog-foreground) shadow-(--dialog-shadow)",
            /* Fullscreen only changes the box the morph lands in — the CSS
               variables still theme it, and every gesture behaves the same. */
            ctx.fullscreen && "h-dvh max-h-none w-screen max-w-none rounded-none",
            // debug: the surface is the box Flip animates; the window is what
            // gets scaled and faded inside it
            ctx.debug && "outline-2 outline-fuchsia-500/80",
            className
          )}
          {...props}>
          {/* Stays in normal flow — declaring position:absolute here would
              collapse the surface's auto height before it can be measured and
              the dialog would never grow. The controller positions it
              absolutely only for the duration of the morph. */}
          <div
            ref={windowRef}
            data-slot="dialog-window"
            data-fullscreen={ctx.fullscreen ? "true" : undefined}
            className={cn(
              "flex min-h-0 flex-1 origin-center flex-col gap-(--dialog-gap) overflow-auto overscroll-contain p-(--dialog-padding) text-sm",
              "rounded-(--dialog-radius) bg-(--dialog-surface)",
              /* Edge to edge means the notch and the home indicator are now
                 the component's problem. */
              ctx.fullscreen &&
                "pt-[calc(var(--dialog-padding)+env(safe-area-inset-top))] pr-[calc(var(--dialog-padding)+env(safe-area-inset-right))] pb-[calc(var(--dialog-padding)+env(safe-area-inset-bottom))] pl-[calc(var(--dialog-padding)+env(safe-area-inset-left))]",
              ctx.debug && "outline-1 outline-emerald-400/80",
              /* The gesture is claimed here, not on the surface: a touch lands
                 on the content, and Chrome cancels the pointer if the element
                 under the finger allows panning. Once the content overflows,
                 scrolling wins the vertical axis back. */
              "touch-none data-[scrollable=true]:touch-pan-y",
              /* iOS Safari zooms the page when a focused field computes below
                 16px, and Tailwind's preflight gives form controls `font: inherit`
                 — so the `text-sm` above would hand every bare <input> in here a
                 14px size and a zoom with it. Floored, not set: `max()` keeps a
                 larger root font-size or a consumer's bigger field intact, and
                 the guard only applies where a zoom can happen at all. The
                 dialog's own 14px type is untouched. */
              "pointer-coarse:[&_input]:text-[max(16px,1rem)] pointer-coarse:[&_textarea]:text-[max(16px,1rem)] pointer-coarse:[&_select]:text-[max(16px,1rem)]",
              /* Media never answers a drag with a drag of its own. The
                 pointerdown is already defaulted away in onPointerDown, but a
                 selection that began outside the dialog and was dragged into it
                 still lands here, and WebKit treats an image as draggable
                 independently of the selection. */
              "[&_img]:[-webkit-user-drag:none] [&_video]:[-webkit-user-drag:none] [&_img]:select-none [&_video]:select-none",
              // interactive children own their own gestures
              "[&_input]:touch-auto [&_textarea]:touch-auto [&_select]:touch-auto [&_button]:touch-auto [&_a]:touch-auto [&_label]:touch-auto",
              windowClassName
            )}>
            {children}
            {showCloseButton && (
              <DialogClose
                aria-label="Close"
                className="absolute top-3 right-3 inline-flex size-7 items-center justify-center rounded-full text-muted-foreground opacity-70 transition-all hover:opacity-100 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring after:absolute after:-inset-1.5 after:content-['']">
                <X className="size-4" />
              </DialogClose>
            )}
          </div>
        </div>
      </div>
    </dialog>
  )
}

function DialogHeader({ className, ...props }: ComponentProps<"header">) {
  return <header data-slot="dialog-header" className={cn("flex flex-col gap-2", className)} {...props} />
}

function DialogFooter({ className, ...props }: ComponentProps<"footer">) {
  return (
    <footer
      data-slot="dialog-footer"
      className={cn("mt-auto flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  )
}

function DialogTitle({ className, ...props }: ComponentProps<"h2">) {
  const { titleId, setHasTitle } = useDialog()
  useEffect(() => {
    setHasTitle(true)
    return () => setHasTitle(false)
  }, [setHasTitle])

  return (
    <h2
      id={titleId}
      data-slot="dialog-title"
      className={cn("text-base leading-none font-medium", className)}
      {...props}
    />
  )
}

function DialogDescription({ className, ...props }: ComponentProps<"p">) {
  const { descriptionId, setHasDescription } = useDialog()
  useEffect(() => {
    setHasDescription(true)
    return () => setHasDescription(false)
  }, [setHasDescription])

  return (
    <p
      id={descriptionId}
      data-slot="dialog-description"
      className={cn("text-sm text-(--dialog-muted-foreground)", className)}
      {...props}
    />
  )
}

Dialog.Trigger = DialogTrigger
Dialog.Header = DialogHeader
Dialog.Footer = DialogFooter
Dialog.Title = DialogTitle
Dialog.Description = DialogDescription
Dialog.Content = DialogContent
Dialog.Close = DialogClose

export { Dialog }
