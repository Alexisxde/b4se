"use client"
import { Sheet, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { monthStringShort } from "@/utils/month-string"
import { Receipt } from "lucide-react"
import { motion } from "motion/react"
import { useState } from "react"
import { SubscriptionDetailSheet } from "../../subscription/components/subscription-detail-sheet"
import { useAnalyticsSubscriptions } from "../hooks/use-analytics-subscriptions"
import { CardEmptyState } from "./analytics-card-empty"

type Props = { month: number; year: number }

export default function AnalyticsCardServices({ month, year }: Props) {
	const { data = [], isLoading } = useAnalyticsSubscriptions({ month, year })
	const [selectedId, setSelectedId] = useState<string | null>(null)
	const [isDetailOpen, setIsDetailOpen] = useState(false)
	const [isListOpen, setIsListOpen] = useState(false)

	const handleOpenDetail = (id: string) => {
		setSelectedId(id)
		setIsDetailOpen(true)
	}

	if (isLoading) return <article className="rounded-4xl bg-card p-6 min-h-64 animate-pulse" />

	return (
		<motion.article
			initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
			animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
			transition={{ duration: 0.3, delayChildren: 0.2, staggerChildren: 0.1 }}
			className="flex flex-col rounded-4xl bg-card p-6 shadow-md space-y-4 flex-1">
			<header className="flex items-center gap-2">
				<Receipt className="text-primary size-5" />
				<h3 className="text-primary font-medium text-base">Suscripciones</h3>
			</header>
			{data.length === 0 ? (
				<CardEmptyState />
			) : (
				<>
					<section className="flex flex-col gap-1">
						{data.slice(0, 5).map(({ id, name, logo, amount, period, startDate, endDate }) => (
							<button
								type="button"
								key={id}
								onClick={() => handleOpenDetail(id)}
								className="flex items-center gap-3 p-2 rounded-2xl hover:bg-muted transition-colors text-left w-full group">
								<div
									className="[&_svg]:size-5 flex items-center justify-center"
									dangerouslySetInnerHTML={{ __html: logo || "" }}
								/>
								<div className="flex flex-col gap-1 w-full">
									<span className="text-sm font-medium leading-none text-foreground group-hover:text-primary transition-colors">
										{name}
									</span>
									<span className="text-xs text-muted-foreground">
										{new Date(startDate).getUTCDate()} {monthStringShort(new Date(startDate).getUTCMonth())} -{" "}
										{new Date(endDate).getUTCDate()} {monthStringShort(new Date(endDate).getUTCMonth())}
									</span>
								</div>
								<span className="w-28 text-right text-sm text-muted-foreground pr-2 group-hover:text-primary transition-colors">
									${amount.toFixed(2)}/{period === "month" ? "mes" : "año"}
								</span>
							</button>
						))}
					</section>
					{data.length > 5 && (
						<footer className="flex items-center justify-center -mt-2">
							<button
								type="button"
								onClick={() => setIsListOpen(true)}
								className="text-center text-[11px] text-muted-foreground underline hover:text-primary transition-colors">
								+{data.length - 5} más
							</button>
						</footer>
					)}
				</>
			)}

			<Sheet open={isListOpen} onOpenChange={setIsListOpen}>
				<SheetHeader className="mb-6">
					<SheetTitle className="flex items-center gap-2">Suscripciones</SheetTitle>
				</SheetHeader>
				<div className="w-full sm:max-w-md overflow-y-auto">
					<div className="flex flex-col gap-1">
						{data.map(({ id, name, logo, amount, period, startDate, endDate }) => (
							<button
								type="button"
								key={id}
								onClick={() => handleOpenDetail(id)}
								className="flex items-center gap-3 p-3 rounded-2xl hover:bg-muted transition-colors text-left w-full group">
								<div
									className="[&_svg]:size-5 flex items-center justify-center"
									dangerouslySetInnerHTML={{ __html: logo || "" }}
								/>
								<div className="flex flex-col gap-1 w-full">
									<span className="text-sm font-medium leading-none text-foreground group-hover:text-primary transition-colors">
										{name}
									</span>
									<span className="text-xs text-muted-foreground">
										{new Date(startDate).getUTCDate()} {monthStringShort(new Date(startDate).getUTCMonth())} -{" "}
										{new Date(endDate).getUTCDate()} {monthStringShort(new Date(endDate).getUTCMonth())}
									</span>
								</div>
								<span className="w-28 text-right text-sm text-muted-foreground pr-2 group-hover:text-primary transition-colors">
									${amount.toFixed(2)}/{period === "month" ? "mes" : "año"}
								</span>
							</button>
						))}
					</div>
				</div>
			</Sheet>
			<SubscriptionDetailSheet id={selectedId} open={isDetailOpen} onOpenChange={setIsDetailOpen} />
		</motion.article>
	)
}
