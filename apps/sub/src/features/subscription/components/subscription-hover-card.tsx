"use client"
import type { Subcription } from "@/features/subscription/suscription"
import { Button } from "@b4se/ui"
import { AnimatePresence, motion } from "motion/react"
import { type MouseEvent, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useRenewSubscription } from "../hooks/use-renew-subscription"
import { SubscriptionDetailSheet } from "./subscription-detail-sheet"

interface SubscriptionHoverCardProps {
  subscriptions: {
    sub: Subcription
    type: "start" | "end"
    amount: number
    isExpired?: boolean
  }[]
  day: number
  mousePosition: { x: number; y: number }
  isVisible: boolean
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export function SubscriptionHoverCard({
  subscriptions,
  day,
  mousePosition,
  isVisible,
  onMouseEnter,
  onMouseLeave
}: SubscriptionHoverCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const [activeDay, setActiveDay] = useState<number | null>(null)
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

  useLayoutEffect(() => {
    if (isVisible && cardRef.current) {
      const updatePosition = () => {
        if (!cardRef.current) return
        const rect = cardRef.current.getBoundingClientRect()
        const padding = 40
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight

        let x = mousePosition.x + 15
        let y = mousePosition.y - 20
        if (x + rect.width > viewportWidth - padding) x = mousePosition.x - rect.width - 15
        if (x < padding) x = padding
        if (y + rect.height > viewportHeight - padding) y = viewportHeight - rect.height - padding
        if (y < padding) y = padding
        setCoords({ x, y })
        setActiveDay(day)
      }

      if (day !== activeDay) updatePosition()
    }
    if (!isVisible && activeDay !== null) setActiveDay(null)
  }, [isVisible, day, mousePosition.x, mousePosition.y, activeDay])

  const handleOpenDetail = (id: string) => {
    setSelectedId(id)
    setIsDetailOpen(true)
  }

  return (
    <>
      <AnimatePresence>
        {isVisible && subscriptions.length > 0 && (
          <motion.div
            key={day}
            ref={cardRef}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className="fixed z-20 rounded-xl shadow-2xl border border-outline/50 bg-card overflow-hidden hidden sm:block min-w-70 max-w-[320px] pointer-events-auto"
            style={{
              left: coords.x,
              top: coords.y,
              maxHeight: "calc(100vh - 100px)"
            }}
            initial={{ opacity: 0, scale: 0.9, y: 10, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.95, y: 10, filter: "blur(8px)" }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}>
            <div className="p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between border-b border-outline/50 pb-2">
                <span className="text-sm font-semibold text-foreground">Suscripciones del día {day}</span>
                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {subscriptions.length}
                </span>
              </div>
              <motion.div
                className="flex flex-col gap-2"
                style={{ scrollbarGutter: "stable" }}
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
                }}>
                {sortedSubscriptions.map((item, idx) => (
                  <motion.div
                    key={`${item.sub.id}-${idx}`}
                    variants={{
                      hidden: { opacity: 0, x: -10 },
                      visible: { opacity: 1, x: 0 }
                    }}
                    onClick={() => handleOpenDetail(item.sub.id)}
                    className="flex items-center gap-3 p-1 hover:bg-muted/50 rounded-lg cursor-pointer ">
                    <div
                      className="size-8 flex items-center justify-center bg-muted rounded-lg p-1.5 [&_svg]:size-full"
                      dangerouslySetInnerHTML={{ __html: item.sub.service.logo ?? "" }}
                    />
                    <div className="flex flex-col flex-1">
                      <span className="text-sm font-medium text-foreground truncate">{item.sub.service.name}</span>
                      <div className="flex items-center gap-2">
                        {item.type === "start" ? (
                          <div className="size-2 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20" />
                        ) : (
                          <div className="size-2 rounded-full bg-destructive" />
                        )}
                        <span className="text-xs text-muted-foreground">
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
                            className="h-7 px-2 text-[10px] font-semibold tracking-tight"
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
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <SubscriptionDetailSheet id={selectedId} open={isDetailOpen} onOpenChange={setIsDetailOpen} />
    </>
  )
}
