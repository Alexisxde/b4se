"use client"

import { forwardRef, useId, type ComponentPropsWithRef, type ReactNode } from "react"
import { cn } from "../lib/utils"

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
            "relative flex flex-col justify-center bg-card text-card-foreground border border-outline px-4 py-2.5 min-h-16 rounded-xl w-full focus-within:ring-2 focus-within:ring-ring/50 focus-within:border-ring transition-all duration-200 ease-in-out cursor-text",
            fieldClassName
          )}>
          <label
            htmlFor={id}
            className={cn(
              "text-xs font-medium text-muted-foreground select-none cursor-pointer transition-colors",
              labelClassName
            )}>
            {label}
          </label>
          <div className="flex items-center gap-2 mt-0.5">
            {icon && (
              <div className="text-muted-foreground shrink-0 flex items-center justify-center pointer-events-none">
                {icon}
              </div>
            )}
            <textarea
              ref={ref}
              id={id}
              className={cn(
                "w-full bg-transparent p-0 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none resize-none",
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
