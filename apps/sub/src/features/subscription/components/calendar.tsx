"use client"
import { AnimatePresence, motion, type HTMLMotionProps, type Variants } from "motion/react"
import type { ReactNode } from "react"

type CalendarAnimationProps = {
  children: ReactNode
  className?: string
  uniqueKey: string | number
}

const variants: { container: Variants; item: Variants } = {
  container: {
    visible: { transition: { staggerChildren: 0.02 } }
  },
  item: {
    hidden: { opacity: 0, filter: "blur(12px)", y: -60, rotateX: 90 },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      rotateX: 0,
      transition: { type: "spring", bounce: 0.3, duration: 0.5 }
    }
  }
}

export function CalendarAnimation({ children, className, uniqueKey }: CalendarAnimationProps) {
  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={uniqueKey}
        variants={variants.container}
        initial="hidden"
        animate="visible"
        className={className}>
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export function CalendarItem({
  children,
  className,
  ...props
}: { children: ReactNode; className?: string } & HTMLMotionProps<"div">) {
  return (
    <motion.div variants={variants.item} className={className} {...props}>
      {children}
    </motion.div>
  )
}
