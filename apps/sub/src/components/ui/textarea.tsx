"use client"
import { cn } from "@/lib/utils"
import { motion } from "motion/react"
import { useId, type ComponentPropsWithoutRef } from "react"

type TextareaProps = {
	error?: string
	label: string
	icon?: React.ReactNode
	optional?: boolean
	fieldClassName?: string
	labelClassName?: string
} & ComponentPropsWithoutRef<"textarea">

export const Textarea = ({ label, className, fieldClassName, labelClassName, error, ...props }: TextareaProps) => {
	const id = useId()

	return (
		<>
			<motion.label
				animate={error ? { x: [0, -24, 24, -24, 24, 0] } : { x: 0 }}
				transition={{ duration: 0.6, ease: "easeInOut" }}
				htmlFor={id}
				className={cn(
					"relative flex flex-col gap-1 bg-card shadow-[0_0_0_.5px_#0000000d,0_.5px_2.5px_#00000029] dark:shadow-[0_0_0_.5px_#2d372d,0_.5px_2.5px_#00000029] p-4 min-h-32 rounded-xl w-full focus-within:ring-2 focus-within:ring-input transition-all duration-200 ease-in-out",
					fieldClassName,
					{ "ring-2 ring-destructive focus-within:ring-destructive": error }
				)}>
				<span className={cn("text-xs font-medium text-label", labelClassName)}>{label}</span>
				<textarea
					id={id}
					className={cn(
						"absolute inset-0 px-4 pt-8 pb-4 focus:outline-none text-foreground text-sm bg-transparent resize-none",
						className
					)}
					{...props}
				/>
			</motion.label>
			{error && (
				<motion.p
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, ease: "easeOut" }}
					className="text-destructive text-xs">
					{error}
				</motion.p>
			)}
		</>
	)
}

export default Textarea
