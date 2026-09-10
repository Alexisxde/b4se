import { monthStringLong } from "@/utils/month-string"
import { Button, Input, Popover, Tooltip } from "@b4se/ui"
import { ArrowLeft, ArrowRight, SlidersHorizontal } from "lucide-react"
import { SubscriptionCreatePopover } from "./subscription-create-popover"

type Props = {
  total: string
  month: number
  year: number
  prevMonth: () => void
  nextMonth: () => void
}

export function HeaderCalendar({ month, year, prevMonth, nextMonth }: Props) {
  return (
    <header className="flex items-center justify-between mb-2">
      <h2 className="text-muted-foreground text-2xl font-medium tracking-tight">
        {monthStringLong(month)}, {year}
      </h2>
      <div className="flex items-center gap-2">
        <Popover>
          <Popover.Trigger
            render={
              <Button variant="outline" className="rounded-full">
                <SlidersHorizontal className="size-5" /> Filtros
              </Button>
            }
          />
          <Popover.Content>
            <Popover.Header>
              <Popover.Title className="flex items-center gap-2">
                <SlidersHorizontal className="size-5" /> Filtros
              </Popover.Title>
            </Popover.Header>
            <Popover.Body>
              <Input label="Nombre" placeholder="Buscar por nombre..." />
            </Popover.Body>
            <Popover.Footer>
              <Button variant="secondary">Limpiar filtros</Button>
              <Button>Aplicar filtros</Button>
            </Popover.Footer>
          </Popover.Content>
        </Popover>
        {/* <div className="bg-card space-x-0.5 px-1.5 py-1 rounded-full">
          <Button variant="ghost" size="xs" className="rounded-full">
            <SquareSplitVertical className="size-5" />
          </Button>
          <Button variant="ghost" size="xs" className="rounded-full">
            <Columns4 className="size-5" />
          </Button>
          <Button variant="secondary" size="xs" className="rounded-full">
            <Grid3x3 className="size-5" />
          </Button>
        </div> */}
        <div className="flex items-center gap-1.5">
          <Tooltip>
            <Tooltip.Trigger
              render={
                <Button variant="secondary" size="icon" onClick={prevMonth}>
                  <ArrowLeft className="size-5" />
                </Button>
              }
            />
            <Tooltip.Content>Anterior mes</Tooltip.Content>
          </Tooltip>
          <Tooltip>
            <Tooltip.Trigger
              render={
                <Button variant="secondary" size="icon" onClick={nextMonth}>
                  <ArrowRight className="size-5" />
                </Button>
              }
            />
            <Tooltip.Content>Siguiente mes</Tooltip.Content>
          </Tooltip>
        </div>
        <SubscriptionCreatePopover />
      </div>
    </header>
  )
}

// <TextAnimate
//   className="text-5xl md:text-6xl text-primary font-semibold"
//   duration={0.3}
//   getDelay={(i) => i * 0.05}
//   transition={{ ease: [0.175, 0.885, 0.32, 1.1] }}>
//   {total}
// </TextAnimate>
