"use client"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { monthStringLong } from "@/utils/month-string"
import { motion } from "motion/react"
import { useMemo, useRef, useState } from "react"
import { useSubscriptions } from "../hooks/use-subscriptions"
import type { Subcription } from "../suscription"
import { CalendarAnimation, CalendarItem } from "./calendar"
import HeaderCalendar from "./header-calendar"
import { SubscriptionDaySheet } from "./subscription-day-sheet"
import { SubscriptionHoverCard } from "./subscription-hover-card"

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

export default function SubscriptionCalendar() {
	const isMobile = useIsMobile()
	const [currentDate, setCurrentDate] = useState(new Date())
	const [hoveredDay, setHoveredDay] = useState<number | null>(null)
	const [selectedDay, setSelectedDay] = useState<number | null>(null)
	const [isSheetOpen, setIsSheetOpen] = useState(false)
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
	const [isHoveringCard, setIsHoveringCard] = useState(false)
	const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

	const month = currentDate.getMonth()
	const year = currentDate.getFullYear()
	const { data, isLoading } = useSubscriptions({ month, year })

	const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
	const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

	const firstDayOfMonth = new Date(year, month, 1).getDay()
	const daysInMonth = new Date(year, month + 1, 0).getDate()
	const daysInPreviousMonth = new Date(year, month, 0).getDate()

	const subscriptionsByDay = useMemo(() => {
		if (!data) return {}
		const map: Record<number, { sub: Subcription; type: "start" | "end"; amount: number; isExpired?: boolean }[]> = {}
		const now = new Date()
		const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))

		for (const sub of data) {
			for (const h of sub.history) {
				const sDate = new Date(h.startDate)
				const eDate = new Date(h.endDate)

				if (sDate.getUTCMonth() === month && sDate.getUTCFullYear() === year) {
					const day = sDate.getUTCDate()
					if (!map[day]) map[day] = []
					map[day].push({ sub, type: "start", amount: h.amount })
				}

				if (eDate.getUTCMonth() === month && eDate.getUTCFullYear() === year) {
					const day = eDate.getUTCDate()
					if (!map[day]) map[day] = []
					const eDateMidnight = new Date(Date.UTC(eDate.getUTCFullYear(), eDate.getUTCMonth(), eDate.getUTCDate()))
					const isExpired = eDateMidnight < today
					map[day].push({ sub, type: "end", amount: h.amount, isExpired })
				}
			}
		}
		return map
	}, [data, month, year])

	const totalAmount = useMemo(() => {
		if (!data) return 0
		return data.reduce((acc, sub) => {
			const monthTotal = sub.history.reduce((hAcc, h) => {
				const sDate = new Date(h.startDate)
				if (sDate.getUTCMonth() === month && sDate.getUTCFullYear() === year) {
					return hAcc + h.amount
				}
				return hAcc
			}, 0)
			return acc + monthTotal
		}, 0)
	}, [data, month, year])

	const today = new Date()
	const isToday = (day: number) => today.getDate() === day && today.getMonth() === month && today.getFullYear() === year

	const calendarDays = []

	for (let i = firstDayOfMonth - 1; i >= 0; i--) {
		calendarDays.push({
			day: daysInPreviousMonth - i,
			month: "prev",
			key: `prev-${daysInPreviousMonth - i}`
		})
	}

	for (let i = 1; i <= daysInMonth; i++) {
		calendarDays.push({
			day: i,
			month: "current",
			key: `current-${i}`
		})
	}

	const remainingDays = 42 - calendarDays.length
	for (let i = 1; i <= remainingDays; i++) {
		calendarDays.push({
			day: i,
			month: "next",
			key: `next-${i}`
		})
	}

	const handleMouseMove = (e: React.MouseEvent) => {
		setMousePosition({ x: e.clientX, y: e.clientY })
	}

	const handleDayLeave = () => {
		if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
		closeTimeoutRef.current = setTimeout(() => {
			if (!isHoveringCard) {
				setHoveredDay(null)
			}
		}, 100)
	}

	const handleCardEnter = () => {
		if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
		setIsHoveringCard(true)
	}

	const handleCardLeave = () => {
		setIsHoveringCard(false)
		setHoveredDay(null)
	}

	return (
		<div className="flex flex-col size-full text-foreground relative">
			<HeaderCalendar
				month={month}
				year={year}
				total={
					isLoading
						? "$0.00"
						: `$${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
				}
				prevMonth={prevMonth}
				nextMonth={nextMonth}
			/>
			<div className="grid grid-cols-7 bg-card my-1 rounded-4xl">
				{DAYS.map((day) => (
					<div
						key={day}
						className="py-4 text-center text-xs font-medium uppercase border-r border-border/40 last:border-r-0 text-muted-foreground">
						{day}
					</div>
				))}
			</div>
			<CalendarAnimation
				className="flex-1 grid grid-cols-7 grid-rows-6 auto-rows-fr gap-1"
				uniqueKey={`${month}-${year}`}>
				{calendarDays.map(({ day, month: dayMonth, key }) => {
					const currentIsToday = dayMonth === "current" && isToday(day)
					const daySubscriptions = dayMonth === "current" ? subscriptionsByDay[day] || [] : []

					return (
						<CalendarItem
							key={key}
							onMouseEnter={(e) => {
								if (daySubscriptions.length > 0 && !isMobile) {
									if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
									setHoveredDay(day)
									handleMouseMove(e)
								}
							}}
							onMouseLeave={handleDayLeave}
							onMouseMove={handleMouseMove}
							onClick={() => {
								if (daySubscriptions.length > 0 && isMobile) {
									setSelectedDay(day)
									setIsSheetOpen(true)
								}
							}}
							className={cn(
								"rounded-full md:rounded-4xl relative flex flex-col p-4 bg-card transition-colors hover:bg-muted duration-200 ease-in-out h-full",
								dayMonth !== "current" && "bg-muted/10 hover:bg-muted/10 text-muted-foreground/20",
								hoveredDay === day && dayMonth === "current" && "z-10 bg-primary/10 hover:bg-primary/10",
								isMobile && daySubscriptions.length > 0 && "cursor-pointer active:scale-95"
							)}>
							<span
								className={cn(
									"absolute bottom-2 left-4 flex items-center justify-center size-8 text-sm font-medium rounded-full",
									currentIsToday ? "bg-primary text-primary-foreground" : "text-foreground/80"
								)}>
								{day}
							</span>
							<div className="flex-1 flex items-center justify-center -space-x-1">
								{daySubscriptions.slice(0, 2).map((item, idx) => (
									<div key={`${key}-sub-${idx}`} className="relative p-1">
										<motion.div
											initial={{ opacity: 0, scale: 0.9, y: 10, filter: "blur(10px)" }}
											animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
											exit={{ opacity: 0, scale: 0.95, y: 10, filter: "blur(10px)" }}
											className="[&_svg]:size-5 z-2 flex items-center justify-center"
											dangerouslySetInnerHTML={{ __html: item.sub.service.logo ?? "" }}
										/>
									</div>
								))}
								{daySubscriptions.length > 2 && (
									<div className="size-6 flex items-center justify-center bg-accent/50 rounded-full border border-border/50 ml-1">
										<span className="text-[11px] font-semibold text-muted-foreground">
											+{daySubscriptions.length - 2}
										</span>
									</div>
								)}
							</div>
						</CalendarItem>
					)
				})}
			</CalendarAnimation>
			<SubscriptionHoverCard
				isVisible={hoveredDay !== null || isHoveringCard}
				day={hoveredDay ?? 0}
				mousePosition={mousePosition}
				subscriptions={hoveredDay ? subscriptionsByDay[hoveredDay] || [] : []}
				onMouseEnter={handleCardEnter}
				onMouseLeave={handleCardLeave}
			/>
			<SubscriptionDaySheet
				open={isSheetOpen}
				onOpenChange={setIsSheetOpen}
				day={selectedDay ?? 0}
				month={monthStringLong(month)}
				year={year}
				subscriptions={selectedDay ? subscriptionsByDay[selectedDay] || [] : []}
			/>
		</div>
	)
}
