import { TextAnimate } from "@/components/ui/text-animate"
import { useIsMobile } from "@/hooks/use-mobile"
import { monthStringLong } from "@/utils/month-string"
import { Button } from "@b4se/ui"
import { ChevronLeft, ChevronRight } from "lucide-react"
import SubscriptionCreatePopover from "./subscription-create-popover"

type Props = {
  total: string
  month: number
  year: number
  prevMonth: () => void
  nextMonth: () => void
}

export default function HeaderCalendar({ month, year, total, prevMonth, nextMonth }: Props) {
  const isMobile = useIsMobile()

  return (
    <header className="relative flex flex-col items-center gap-1 px-3 mb-2">
      {!isMobile && (
        <div className="absolute w-full flex items-center justify-end">
          <SubscriptionCreatePopover />
        </div>
      )}
      <h2 className="text-muted-foreground text-base font-medium tracking-tight">
        {monthStringLong(month)}, {year}
      </h2>
      <div className="flex items-center gap-4">
        <Button ripple onClick={prevMonth} variant="outline">
          <ChevronLeft className="size-6" />
        </Button>
        <TextAnimate
          className="text-5xl md:text-6xl text-primary font-semibold"
          duration={0.3}
          getDelay={(i) => i * 0.05}
          transition={{ ease: [0.175, 0.885, 0.32, 1.1] }}>
          {total}
        </TextAnimate>
        <Button ripple onClick={nextMonth} variant="outline">
          <ChevronRight className="size-6" />
        </Button>
      </div>
    </header>
  )
}
