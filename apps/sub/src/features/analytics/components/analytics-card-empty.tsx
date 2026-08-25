"use client"
import { Plus, Receipt } from "lucide-react"
import { motion } from "motion/react"

export function CardEmptyState() {
	return (
		<section className="flex flex-col flex-1 items-center justify-center size-full min-h-40 p-6 text-center gap-3">
			<motion.div
				initial={{ scale: 0.9, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				transition={{ type: "spring", stiffness: 300, damping: 20 }}
				className="p-4 rounded-full bg-muted/50">
				<Receipt className="size-7 text-muted-foreground/60" />
			</motion.div>
			<div className="space-y-1">
				<h3 className="text-base font-semibold text-foreground/80">No hay Datos</h3>
				<p className="text-xs text-muted-foreground/70 balance max-w-64">
					Actualmente no tenés ninguna suscripción. Agregá tus suscripciones en el botón
					<span className="inline-flex items-center justify-center ml-0.75 p-0.75 bg-primary text-primary-foreground rounded-full align-middle">
						<Plus className="size-3" />
					</span>
					.
				</p>
			</div>
		</section>
	)
}
