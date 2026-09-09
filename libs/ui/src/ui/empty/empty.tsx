"use client"
import { cn } from "@/lib/utils"
import type { ComponentProps } from "react"

interface EmptyProps extends ComponentProps<"article"> {}

function Empty({ className, ...props }: EmptyProps) {
  return (
    <article
      className={cn(
        "flex size-full min-h-40 flex-1 flex-col items-center justify-center gap-2 p-6 text-center bg-card rounded-4xl",
        className
      )}
      {...props}
    />
  )
}

interface EmptyIconProps extends ComponentProps<"div"> {}

function EmptyIcon({ className, ...props }: EmptyIconProps) {
  return <div className={cn("size-fit rounded-full bg-muted/50 p-4", className)} {...props} />
}

interface EmptyTitleProps extends ComponentProps<"h3"> {}

function EmptyTitle({ className, ...props }: EmptyTitleProps) {
  return <h3 className={cn("text-xl font-semibold text-foreground", className)} {...props} />
}

interface EmptyDescriptionProps extends ComponentProps<"p"> {}

function EmptyDescription({ className, ...props }: EmptyDescriptionProps) {
  return <p className={cn("max-w-72 text-sm text-muted-foreground balance", className)} {...props} />
}

Empty.Icon = EmptyIcon
Empty.Title = EmptyTitle
Empty.Description = EmptyDescription

export { Empty }
