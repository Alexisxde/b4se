"use client"
import { Sheet, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import type { Subcription } from "@/features/subscription/suscription"
import { Button } from "@b4se/ui"
import { motion } from "motion/react"
import { type MouseEvent, useMemo, useState } from "react"
import { useRenewSubscription } from "../hooks/use-renew-subscription"
import { SubscriptionDetailSheet } from "./subscription-detail-sheet"

interface SubscriptionDaySheetProps {
  subscriptions: {
    sub: Subcription
    type: "start" | "end"
    amount: number
    isExpired?: boolean
  }[]
  day: number
  month: string
  year?: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SubscriptionDaySheet({ subscriptions, day, month, open, onOpenChange }: SubscriptionDaySheetProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const { mutate: renew, isPending } = useRenewSubscription()

  const sortedSubscriptions = useMemo(() => {
    return [...subscriptions].sort((a, b) => {
      if (a.type === "start" && b.type === "end") return -1
      if (a.type === "end" && b.type === "start") return 1
      return 0
    })
  }, [subscriptions])

  const handleOpenDetail = (id: string) => {
    setSelectedId(id)
    setIsDetailOpen(true)
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetHeader>
          <SheetTitle>
            Suscripciones del {day} de {month}
          </SheetTitle>
        </SheetHeader>
        <div className="space-y-3">
          <div className="flex flex-col gap-1 mt-6 overflow-y-auto pb-10">
            {sortedSubscriptions.map((item, idx) => (
              <motion.div
                key={`${item.sub.id}-${idx}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => handleOpenDetail(item.sub.id)}
                className="flex items-center gap-4 p-3 hover:bg-muted rounded-2xl cursor-pointer transition-colors">
                <div
                  className="size-12 flex items-center justify-center bg-card rounded-xl p-2.5 [&_svg]:size-full border border-outline/50"
                  dangerouslySetInnerHTML={{ __html: item.sub.service.logo ?? "" }}
                />
                <div className="flex flex-col flex-1">
                  <span className="text-base font-medium text-foreground truncate">{item.sub.service.name}</span>
                  <div className="flex items-center gap-2">
                    {item.type === "start" ? (
                      <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    ) : (
                      <div className="size-2 rounded-full bg-destructive" />
                    )}
                    <span className="text-sm text-muted-foreground font-medium">
                      {item.type === "start" ? "Suscripción" : item.isExpired ? "Expiró" : "Expira"} • $
                      {item.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
                {(() => {
                  const isRenewed = sortedSubscriptions.some((s) => s.sub.id === item.sub.id && s.type === "start")
                  return (
                    item.type === "end" &&
                    !item.isExpired &&
                    !isRenewed && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-4 text-xs font-semibold rounded-full"
                        onClick={(e: MouseEvent) => {
                          e.stopPropagation()
                          renew(item.sub.id)
                        }}
                        disabled={isPending}>
                        {isPending ? "..." : "Renovar"}
                      </Button>
                    )
                  )
                })()}
              </motion.div>
            ))}
          </div>
        </div>
      </Sheet>
      <SubscriptionDetailSheet id={selectedId} open={isDetailOpen} onOpenChange={setIsDetailOpen} />
    </>
  )
}
