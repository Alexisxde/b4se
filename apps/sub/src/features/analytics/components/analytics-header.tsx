"use client"

import { TextAnimate } from "@/components/ui/text-animate"
import SubscriptionCreatePopover from "@/features/subscription/components/subscription-create-popover"
import { useIsMobile } from "@/hooks/use-mobile"
import { monthStringLong } from "@/utils/month-string"
import { Button } from "@b4se/ui"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion } from "motion/react"

type Props = {
  month: number
  year: number
  prevMonth: () => void
  nextMonth: () => void
}

export default function AnalyticsHeader({ month, year, prevMonth, nextMonth }: Props) {
  const isMobile = useIsMobile()

  return (
    <motion.header
      initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.3, delayChildren: 0.2, staggerChildren: 0.1 }}
      className="relative flex flex-col items-center gap-1 px-3 mb-4">
      {!isMobile && (
        <div className="absolute w-full flex items-center justify-end">
          <SubscriptionCreatePopover />
        </div>
      )}
      <h2 className="text-muted-foreground text-base font-medium tracking-tight">Estadísticas</h2>
      <div className="flex items-center gap-4">
        <Button ripple type="button" onClick={prevMonth} variant="outline" className="size-12 rounded-full">
          <ChevronLeft className="size-6" />
        </Button>
        <div className="text-center">
          <TextAnimate
            className="text-5xl md:text-6xl text-primary font-semibold"
            duration={0.3}
            getDelay={(i) => i * 0.02}
            transition={{ ease: [0.175, 0.885, 0.32, 1.1] }}>
            {`${monthStringLong(month)}, ${year}`}
          </TextAnimate>
        </div>
        <Button ripple type="button" onClick={nextMonth} variant="outline" className="size-12 rounded-full">
          <ChevronRight className="size-6" />
        </Button>
      </div>
    </motion.header>
  )
}
