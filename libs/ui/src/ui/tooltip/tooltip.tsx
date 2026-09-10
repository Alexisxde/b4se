"use client"
import { cn } from "@/lib/utils"
import type { ComponentProps, ReactNode, Ref } from "react"
import { createContext, isValidElement, useContext, type ReactElement } from "react"
import { createPortal } from "react-dom"
import { withRender } from "../../lib/helper"
import { useTooltip, type TooltipOptions, type TooltipReturn, type TooltipSide } from "./use-tooltip"

const TooltipContext = createContext<TooltipReturn | null>(null)

export function useTooltipContext() {
  const ctx = useContext(TooltipContext)
  if (!ctx) throw new Error("Tooltip compound components must be used inside <Tooltip>.")
  return ctx
}

export interface TooltipProps extends TooltipOptions {
  children: ReactNode
}

function Tooltip({ children, ...options }: TooltipProps) {
  const tooltip = useTooltip(options)
  return <TooltipContext value={tooltip}>{children}</TooltipContext>
}

export type TooltipTriggerProps = ComponentProps<"span"> & {
  render?: ReactElement
}

function TooltipTrigger({ render, className, children, ...props }: TooltipTriggerProps) {
  const { triggerRef, getTriggerProps } = useTooltipContext()
  const triggerProps = getTriggerProps()

  const shared = {
    ...triggerProps
  }

  if (render) {
    return isValidElement(render) ? withRender(render, shared, className, triggerRef as never, children) : render
  }

  return (
    <span
      ref={triggerRef as Ref<HTMLSpanElement>}
      className={cn("inline-flex w-fit", className)}
      {...shared}
      {...props}>
      {children}
    </span>
  )
}

export interface TooltipContentProps extends ComponentProps<"div"> {
  showArrow?: boolean
}

function TooltipContent({ className, children, showArrow = true, style, ...props }: TooltipContentProps) {
  const { mounted, coords, contentRef, contentId, side } = useTooltipContext()
  if (!mounted || typeof document === "undefined") return null

  return createPortal(
    <div
      ref={contentRef}
      id={contentId}
      role="tooltip"
      style={{
        position: "fixed",
        top: coords.top,
        left: coords.left,
        visibility: "hidden",
        ...style
      }}
      className={cn(
        "z-50 max-w-xs rounded-full border border-outline bg-popover px-3 py-1.5",
        "text-xs text-popover-foreground shadow-md will-change-transform",
        className
      )}
      {...props}>
      {children}
      {showArrow && <TooltipArrow side={side} />}
    </div>,
    document.body
  )
}

interface ToolTipArrowProps extends ComponentProps<"span"> {
  side: TooltipSide
}

function TooltipArrow({ className, side, style, ...props }: ToolTipArrowProps) {
  const { arrowCoords } = useTooltipContext()

  const arrowStyle: React.CSSProperties = { ...style }
  if ((side === "top" || side === "bottom") && arrowCoords?.x !== undefined) {
    arrowStyle.left = `${arrowCoords.x}px`
  } else if ((side === "left" || side === "right") && arrowCoords?.y !== undefined) {
    arrowStyle.top = `${arrowCoords.y}px`
  }

  return (
    <span
      aria-hidden
      style={arrowStyle}
      className={cn(
        "absolute h-2 w-2 rotate-45 border-outline bg-popover",
        {
          "-bottom-1 left-1/2 -translate-x-1/2 border-b border-r": side === "top",
          "-top-1 left-1/2 -translate-x-1/2 border-l border-t": side === "bottom",
          "-right-1 top-1/2 -translate-y-1/2 border-r border-t": side === "left",
          "-left-1 top-1/2 -translate-y-1/2 border-b border-l": side === "right"
        },
        className
      )}
      {...props}
    />
  )
}

Tooltip.Trigger = TooltipTrigger
Tooltip.Content = TooltipContent

export { Tooltip }
