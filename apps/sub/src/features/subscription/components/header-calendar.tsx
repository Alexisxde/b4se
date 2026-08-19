import { TextAnimate } from "@/components/ui/text-animate"
import { monthStringLong } from "@/utils/month-string"
import { Button } from "@b4se/ui"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Props = {
  total: string
  month: number
  year: number
  prevMonth: () => void
  nextMonth: () => void
}

export default function HeaderCalendar({ month, year, total, prevMonth, nextMonth }: Props) {
  return (
    <header className="relative flex flex-col items-center gap-1 px-3 mb-2">
      <h2 className="text-muted-foreground text-base font-medium tracking-tight">
        {monthStringLong(month)}, {year}
      </h2>
      <div className="flex items-center gap-4">
        <Button onClick={prevMonth} variant="secondary" size="icon" className="p-6">
          <ChevronLeft className="size-6" />
        </Button>
        <TextAnimate
          className="text-5xl md:text-6xl text-primary font-semibold"
          duration={0.3}
          getDelay={(i) => i * 0.05}
          transition={{ ease: [0.175, 0.885, 0.32, 1.1] }}>
          {total}
        </TextAnimate>
        <Button onClick={nextMonth} variant="secondary" size="icon" className="p-6">
          <ChevronRight className="size-6" />
        </Button>
      </div>
    </header>
  )
}
