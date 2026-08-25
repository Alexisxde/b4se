"use client"
import { Sheet, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { addDay, format } from "@formkit/tempo"
import { Tag } from "lucide-react"
import { useMemo } from "react"
import { useSubscriptionDetails } from "../hooks/use-subscription-details"

type Props = {
	id: string | null
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function SubscriptionDetailSheet({ id, open, onOpenChange }: Props) {
	const { data: sub, isLoading } = useSubscriptionDetails(id)

	const stats = useMemo(() => {
		if (!sub) return null
		const amount = sub.history[0].amount
		const period = sub.history[0].period === "month" ? "Mes" : "Año"
		const startDateObj = addDay(new Date(sub.history[sub.history.length - 1].startDate), 1)
		const endDateObj = addDay(new Date(sub.history[0].endDate), 1)
		const startDate = format(startDateObj, { date: "medium" })
		const endDate = format(endDateObj, { date: "medium" })
		const daysRemaining = Math.ceil((endDateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
		const totalInvested = sub.history.reduce((acc, h) => acc + h.amount, 0)
		return { amount, period, startDate, endDate, daysRemaining, totalInvested }
	}, [sub])

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetHeader>
				<SheetTitle>Detalle de Suscripción</SheetTitle>
			</SheetHeader>
			{isLoading ? (
				<div className="space-y-3">
					<Skeleton className="border border-border/20 h-22.5 rounded-2xl" />
					<div className="grid grid-cols-2 gap-3">
						<Skeleton className="border border-border/20 h-19.25 rounded-2xl" />
						<Skeleton className="border border-border/20 h-19.25 rounded-2xl" />
					</div>
					<div className="grid grid-cols-[1fr_auto] gap-3 w-full">
						<Skeleton className="border border-border/20 h-19.25 rounded-2xl" />
						<Skeleton className="border border-border/20 h-19.25 rounded-2xl w-20" />
					</div>
					<Skeleton className="h-40 rounded-2xl" />
					<Skeleton className="h-24 rounded-2xl" />
				</div>
			) : sub ? (
				<div className="space-y-3">
					<div className="flex items-center gap-3 bg-muted/30 p-4 rounded-2xl border border-border/20">
						<div
							className="size-14 flex items-center justify-center bg-muted rounded-2xl p-3 [&_svg]:size-full border border-border/50"
							dangerouslySetInnerHTML={{ __html: sub.service.logo ?? "" }}
						/>
						<div>
							<h2 className="text-xl font-medium leading-tight">{sub.service.name}</h2>
							<span className="flex items-center gap-1 text-muted-foreground text-sm font-medium">
								<Tag className="size-3" />
								{sub.category.name}
							</span>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<div className="w-full bg-muted/30 p-4 rounded-2xl border border-border/20">
							<span className="text-[10px] font-medium text-muted-foreground tracking-wider block">Monto</span>
							<span className="text-xl font-medium text-foreground">${sub.history[0]?.amount.toFixed(2)}</span>
						</div>
						<div className="bg-muted/30 p-4 rounded-2xl border border-border/20">
							<span className="text-[10px] font-medium text-muted-foreground tracking-wider block">Periodo</span>
							<span className="text-xl font-medium text-foreground">{stats?.period}</span>
						</div>
					</div>
					<div className="grid grid-cols-[1fr_auto] gap-3 w-full">
						<div className="w-full bg-muted/30 p-4 rounded-2xl border border-border/20">
							<span className="text-[10px] font-medium text-muted-foreground tracking-wider block">Pagó</span>
							<div className="flex items-center gap-3 mt-1">
								<div
									className="size-14 flex items-center justify-center bg-card rounded-2xl p-3 [&_svg]:size-full border border-border/50"
									dangerouslySetInnerHTML={{ __html: sub.history[0].paymentMethod.logo ?? "" }}
								/>
								<span className="text-lg font-medium text-primary">{sub.history[0]?.paymentMethod.name}</span>
							</div>
						</div>
						<div className="w-full bg-muted/30 p-4 rounded-2xl border border-border/20">
							<span className="text-[10px] font-medium text-muted-foreground tracking-wider block">Días restantes</span>
							<div className="flex items-center justify-center gap-1 mt-1">
								<span className="text-3xl font-medium text-primary">
									{(stats?.daysRemaining ?? 0) > 0 ? stats?.daysRemaining : 0}
								</span>
								<span className="text-xs font-medium text-muted-foreground">días</span>
							</div>
						</div>
					</div>
					<div className="bg-muted/30 rounded-2xl border border-border/20 p-4">
						<span className="text-[10px] font-medium text-muted-foreground tracking-wider block">Estadísticas</span>
						<div className="flex justify-between items-center border-b border-border py-2">
							<span className="text-xs text-muted-foreground">Suscripción</span>
							<span className="text-xs font-medium text-foreground">{stats?.startDate}</span>
						</div>
						<div className="flex justify-between items-center border-b border-border py-2">
							<span className="text-xs text-muted-foreground">Vencimiento</span>
							<span className="text-xs font-medium text-foreground">{stats?.endDate}</span>
						</div>
						<div className="flex justify-between items-center pt-2">
							<span className="text-xs font-medium text-muted-foreground">Total invertido</span>
							<span className="text-xs font-medium text-foreground">${stats?.totalInvested.toFixed(2)}</span>
						</div>
					</div>
					<div className="bg-muted/30 p-4 rounded-2xl border border-border/20">
						<span className="text-[10px] font-medium text-muted-foreground tracking-wider block">Observación</span>
						<p className="text-sm text-foreground/80 font-medium leading-relaxed">
							{sub.history[0].note || "Sin observación"}
						</p>
					</div>
				</div>
			) : (
				<div className="h-40 flex items-center justify-center text-muted-foreground font-medium">
					No se encontró la suscripción
				</div>
			)}
		</Sheet>
	)
}
