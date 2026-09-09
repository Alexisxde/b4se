"use client"
import { cn } from "@/lib/utils"
import { forwardRef, useId, type ComponentPropsWithRef, type ReactNode } from "react"

export interface TextareaProps extends Omit<ComponentPropsWithRef<"textarea">, "size"> {
  label: string
  icon?: ReactNode
  endIcon?: ReactNode
  className?: string
  fieldClassName?: string
  labelClassName?: string
  containerClassName?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, icon, endIcon, className, fieldClassName, labelClassName, containerClassName, ...props }, ref) => {
    const id = useId()

    return (
      <div className={cn("flex flex-col gap-1.5 w-full", containerClassName)}>
        <div
          className={cn(
            "relative flex flex-col justify-center bg-card border border-outline p-4 min-h-24 rounded-xl w-full min-w-64 transition-all duration-200 ease-in-out cursor-text focus-within:ring-1 focus-within:ring-ring/50",
            fieldClassName
          )}>
          <label
            htmlFor={id}
            className={cn("text-xs font-medium text-muted-foreground select-none cursor-pointer", labelClassName)}>
            {label}
          </label>
          <div className="flex items-center gap-1.5 mt-0.5">
            {icon && (
              <div className="text-muted-foreground shrink-0 flex items-center justify-center pointer-events-none">
                {icon}
              </div>
            )}
            <textarea
              ref={ref}
              id={id}
              autoComplete="off"
              className={cn(
                "w-full bg-transparent p-0 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none resize-none disabled:cursor-not-allowed truncate",
                className
              )}
              {...props}
            />
            {endIcon && (
              <div className="text-muted-foreground shrink-0 flex items-center justify-center">{endIcon}</div>
            )}
          </div>
        </div>
      </div>
    )
  }
)
