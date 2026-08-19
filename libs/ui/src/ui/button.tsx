"use client"

import { cva, type VariantProps } from "class-variance-authority"
import {
  cloneElement,
  type ComponentPropsWithRef,
  forwardRef,
  isValidElement,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  useCallback,
  useRef
} from "react"
import { gsap } from "../lib/gsap"
import { cn } from "../lib/utils"

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 ease-in-out [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 overflow-hidden active:scale-[0.98] leading-none select-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
        outline: "border border-outline bg-background hover:bg-muted hover:text-foreground text-foreground shadow-xs",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-xs",
        ghost: "hover:bg-muted hover:text-foreground text-foreground",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xs focus-visible:ring-destructive",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        xs: "h-8 text-xs px-3 rounded-md gap-1 [&_svg]:size-3.5",
        sm: "h-9 text-sm px-3.5 rounded-lg gap-1.5 [&_svg]:size-4",
        md: "h-10 text-sm px-4 rounded-xl gap-2 [&_svg]:size-4",
        lg: "h-12 text-base px-6 rounded-2xl gap-2.5 [&_svg]:size-5",
        icon: "size-10 rounded-xl"
      },
      disabled: {
        true: "opacity-50 cursor-not-allowed pointer-events-none"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      disabled: false
    }
  }
)

export type ButtonProps = VariantProps<typeof buttonVariants> & {
  duration?: string
  asChild?: boolean
  ripple?: boolean
  children?: ReactNode
} & ComponentPropsWithRef<"button">

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      duration = "600ms",
      onClick,
      variant,
      size,
      disabled = false,
      asChild = false,
      ripple = true,
      type = "button",
      ...props
    },
    ref
  ) => {
    const rippleContainerRef = useRef<HTMLSpanElement>(null)

    const createRipple = useCallback(
      (event: MouseEvent<HTMLElement>) => {
        if (!ripple || disabled || !rippleContainerRef.current) return

        const prefersReducedMotion =
          typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

        if (prefersReducedMotion) return

        const container = rippleContainerRef.current
        const rect = event.currentTarget.getBoundingClientRect()
        const rippleSize = Math.max(rect.width, rect.height) * 2
        const x = event.clientX - rect.left - rippleSize / 2
        const y = event.clientY - rect.top - rippleSize / 2

        const span = document.createElement("span")
        span.className = "absolute rounded-full pointer-events-none bg-current opacity-20"
        span.style.width = `${rippleSize}px`
        span.style.height = `${rippleSize}px`
        span.style.left = `${x}px`
        span.style.top = `${y}px`
        span.style.transform = "scale(0)"

        container.appendChild(span)

        const dur = duration.includes("ms") ? parseFloat(duration) / 1000 : parseFloat(duration) || 0.6

        gsap.to(span, {
          scale: 1,
          opacity: 0,
          duration: dur,
          ease: "power2.out",
          onComplete: () => {
            span.remove()
          }
        })
      },
      [ripple, disabled, duration]
    )

    const handleClick = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        createRipple(event)
        onClick?.(event)
      },
      [createRipple, onClick]
    )

    const ripples = (
      <span
        ref={rippleContainerRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
      />
    )

    if (asChild && isValidElement(children)) {
      const childProps = children.props as Record<string, unknown>
      return cloneElement(children as ReactElement<Record<string, unknown>>, {
        ...props,
        ...childProps,
        className: cn(buttonVariants({ variant, size, disabled }), className, childProps.className as string),
        onClick: (e: MouseEvent<HTMLButtonElement>) => {
          createRipple(e)
          if (typeof childProps.onClick === "function") {
            childProps.onClick(e)
          }
          onClick?.(e)
        },
        children: (
          <>
            <span className="relative z-10 flex items-center justify-center gap-2">
              {childProps.children as ReactNode}
            </span>
            {ripples}
          </>
        )
      })
    }

    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonVariants({ variant, size, disabled }), className)}
        onClick={handleClick}
        disabled={disabled}
        {...props}>
        <span className="relative z-10 flex items-center justify-center gap-2 w-full">{children}</span>
        {ripples}
      </button>
    )
  }
)
