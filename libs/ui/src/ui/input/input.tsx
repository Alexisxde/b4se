"use client"
import { type ComponentPropsWithRef, forwardRef, type ReactNode, useEffect, useId, useRef } from "react"
import { gsap } from "../../lib/gsap"
import { cn } from "../../lib/utils"

export interface InputProps extends Omit<ComponentPropsWithRef<"input">, "size"> {
  label: string
  error?: string
  icon?: ReactNode
  endIcon?: ReactNode
  optional?: boolean
  fieldClassName?: string
  labelClassName?: string
  containerClassName?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id: customId,
      label,
      error,
      icon,
      endIcon,
      optional,
      className,
      fieldClassName,
      labelClassName,
      containerClassName,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const id = customId || generatedId
    const errorId = `${id}-error`

    const fieldRef = useRef<HTMLDivElement>(null)
    const errorRef = useRef<HTMLParagraphElement>(null)

    useEffect(() => {
      if (error && fieldRef.current) {
        gsap.fromTo(
          fieldRef.current,
          { x: 0 },
          {
            keyframes: [
              { x: -8, duration: 0.06 },
              { x: 8, duration: 0.06 },
              { x: -6, duration: 0.06 },
              { x: 6, duration: 0.06 },
              { x: -3, duration: 0.06 },
              { x: 3, duration: 0.06 },
              { x: 0, duration: 0.06 }
            ],
            ease: "power2.out"
          }
        )
      }
    }, [error])

    useEffect(() => {
      if (error && errorRef.current) {
        gsap.fromTo(errorRef.current, { opacity: 0, y: -4 }, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" })
      }
    }, [error])

    return (
      <div className={cn("flex flex-col gap-1.5 w-full", containerClassName)}>
        <div
          ref={fieldRef}
          className={cn(
            "relative flex flex-col justify-center bg-card border border-outline px-4 py-2.5 min-h-16 rounded-xl w-full max-w-64 transition-all duration-200 ease-in-out cursor-text focus-within:ring-1 focus-within:ring-ring/50",
            disabled && "opacity-50 cursor-not-allowed",
            error && "border-destructive focus-within:ring-destructive/50",
            fieldClassName
          )}
          onClick={(e: React.MouseEvent<HTMLDivElement>) => {
            const inputEl = e.currentTarget?.querySelector("input")
            inputEl.focus()
          }}>
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor={id}
              className={cn(
                "text-xs font-medium text-muted-foreground select-none cursor-pointer",
                error && "text-destructive",
                labelClassName
              )}>
              {label}
            </label>
            {optional && <span className="text-[11px] text-muted-foreground select-none">(Opcional)</span>}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {icon && (
              <div className="text-muted-foreground shrink-0 flex items-center justify-center pointer-events-none">
                {icon}
              </div>
            )}
            <input
              ref={ref}
              id={id}
              disabled={disabled}
              type="text"
              required={required}
              autoComplete="off"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              aria-required={required ? true : undefined}
              className={cn(
                "w-full bg-transparent p-0 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none disabled:cursor-not-allowed truncate",
                className
              )}
              {...props}
            />
            {endIcon && (
              <div className="text-muted-foreground shrink-0 flex items-center justify-center">{endIcon}</div>
            )}
          </div>
        </div>
        {error && (
          <p
            ref={errorRef}
            id={errorId}
            role="alert"
            aria-live="polite"
            className="text-destructive text-xs font-medium pl-1">
            {error}
          </p>
        )}
      </div>
    )
  }
)
