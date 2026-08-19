"use client"
import { AnimatePresence, motion, type Transition, type Variants } from "motion/react"

export type TextAnimateProps = {
  children: string
  className?: string
  duration?: number
  delay?: number
  getDelay?: (index: number) => number
  transition?: Transition
  variants?: Variants
}

export function TextAnimate({
  children,
  className,
  duration = 0.5,
  delay = 0,
  getDelay = (i) => i * 0.05,
  transition = { ease: "easeOut" },
  variants
}: TextAnimateProps) {
  const defaultVariants: Variants = {
    initial: {
      y: "100%",
      opacity: 0,
      filter: "blur(10px)"
    },
    animate: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        ...transition,
        duration,
        delay: delay + getDelay(i)
      }
    }),
    exit: (i: number) => ({
      y: "-100%",
      opacity: 0,
      filter: "blur(10px)",
      transition: {
        ...transition,
        duration,
        delay: getDelay(i)
      }
    })
  }

  const selectedVariants = variants || defaultVariants
  const letters = children.split("")

  return (
    <span className={`inline-flex overflow-hidden ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span key={children} className="flex" initial="initial" animate="animate" exit="exit">
          {letters.map((letter, i) => (
            <motion.span
              key={`${children}-${i}`}
              custom={i}
              variants={selectedVariants}
              className="inline-block whitespace-pre">
              {letter}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
