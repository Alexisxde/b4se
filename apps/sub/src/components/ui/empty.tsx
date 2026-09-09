"use client"
import { cn } from "@b4se/ui"
import { motion } from "motion/react"
import type { ComponentProps, ReactNode } from "react"

type Empty = {
  title: string
  description: string
  icon: ReactNode
} & ComponentProps<"article">

export function Empty({ title, description, icon, className }: Empty) {
  return (
    <article
      className={cn(
        "flex flex-col flex-1 items-center justify-center size-full min-h-40 p-6 text-center gap-3",
        className
      )}>
      <motion.header
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="p-4 rounded-full bg-muted/50">
        {icon}
      </motion.header>
      <section className="space-y-1">
        <h3 className="text-base font-semibold text-foreground/80">{title}</h3>
        <p className="text-xs text-muted-foreground/70 balance max-w-64">{description}</p>
      </section>
    </article>
  )
}
