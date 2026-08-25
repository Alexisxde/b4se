"use client"
import useClickOutside from "@/hooks/use-click-outside"
import { cn } from "@/lib/utils"
import { AnimatePresence, MotionConfig, motion, type Transition, type Variants } from "motion/react"
import { createContext, isValidElement, useContext, useEffect, useId, useRef, useState } from "react"

type SelectContextValue = {
	isOpen: boolean
	open: () => void
	close: () => void
	uniqueId: string
	variants?: Variants
	value?: any
	onValueChange?: (value: any) => void
	selectedContent: React.ReactNode | null
	reportContent: (value: any, content: React.ReactNode) => void
}

const SelectContext = createContext<SelectContextValue | null>(null)

function useSelectLogic({
	defaultOpen = false,
	open: controlledOpen,
	onOpenChange,
	value: controlledValue,
	onValueChange
}: {
	defaultOpen?: boolean
	open?: boolean
	onOpenChange?: (open: boolean) => void
	value?: any
	onValueChange?: (value: any) => void
} = {}) {
	const uniqueId = useId()
	const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
	const [uncontrolledValue, setUncontrolledValue] = useState<any>(undefined)
	const [contents, setContents] = useState<Record<string, React.ReactNode>>({})

	const isOpen = controlledOpen ?? uncontrolledOpen
	const value = controlledValue ?? uncontrolledValue

	const open = () => {
		if (controlledOpen === undefined) setUncontrolledOpen(true)
		onOpenChange?.(true)
	}

	const close = () => {
		if (controlledOpen === undefined) setUncontrolledOpen(false)
		onOpenChange?.(false)
	}

	const handleValueChange = (newValue: any) => {
		if (controlledValue === undefined) setUncontrolledValue(newValue)
		onValueChange?.(newValue)
		close()
	}

	const reportContent = (val: any, content: React.ReactNode) => {
		const key = String(val)
		setContents((prev) => {
			if (prev[key] === content) return prev
			return { ...prev, [key]: content }
		})
	}

	return {
		isOpen,
		open,
		close,
		uniqueId,
		value,
		onValueChange: handleValueChange,
		selectedContent: contents[String(value)] || null,
		reportContent
	}
}

function useSelect() {
	const context = useContext(SelectContext)
	if (!context) throw new Error("SelectItem must be used within Select")
	return context
}

export type SelectProps = {
	children: React.ReactNode
	transition?: Transition
	defaultOpen?: boolean
	open?: boolean
	onOpenChange?: (open: boolean) => void
	variants?: Variants
	className?: string
	value?: any
	onValueChange?: (value: any) => void
} & React.ComponentProps<"div">

export function Select({
	children,
	transition = { type: "spring", bounce: 0.05, duration: 0.3 },
	defaultOpen,
	open,
	onOpenChange,
	variants,
	className,
	value,
	onValueChange,
	...props
}: SelectProps) {
	const SelectLogic = useSelectLogic({ defaultOpen, open, onOpenChange, value, onValueChange })

	return (
		<SelectContext.Provider value={{ ...SelectLogic, variants }}>
			<MotionConfig transition={transition}>
				<div
					key={SelectLogic.uniqueId}
					className={cn("relative flex flex-col items-center justify-center", className)}
					{...props}>
					{children}
				</div>
			</MotionConfig>
		</SelectContext.Provider>
	)
}

type SelectValueProps = {
	placeholder: string
} & React.ComponentProps<typeof motion.div>

export function SelectValue({ placeholder, className, ...props }: SelectValueProps) {
	const { selectedContent } = useSelect()
	return (
		<motion.div
			className={cn("truncate flex items-center gap-1", className, {
				"text-muted-foreground": selectedContent === null
			})}
			{...props}>
			{selectedContent || placeholder}
		</motion.div>
	)
}

export type SelectContentProps = {
	children: React.ReactNode
} & React.ComponentProps<typeof motion.div>

export function SelectContent({ children, className, ...props }: SelectContentProps) {
	const { isOpen, close, uniqueId, variants } = useSelect()
	const ref = useRef<HTMLDivElement>(null!)
	useClickOutside(ref, close)

	return (
		<AnimatePresence initial={false} mode="popLayout">
			{isOpen && (
				<motion.div
					ref={ref}
					layoutId={`select-trigger-${uniqueId}`}
					key={uniqueId}
					id={`select-content-${uniqueId}`}
					role="listbox"
					aria-modal="true"
					className={cn(
						"absolute overflow-hidden border border-border bg-card text-primary shadow-md w-full h-auto p-4 z-10 rounded-3xl",
						className
					)}
					initial="initial"
					animate="animate"
					exit="exit"
					variants={variants}
					{...props}>
					{children}
				</motion.div>
			)}
		</AnimatePresence>
	)
}

export type SelectItemProps = {
	value: string
	children?: React.ReactNode
} & React.ComponentProps<typeof motion.div>

export function SelectItem({ value, children, className, ...props }: SelectItemProps) {
	const { value: v, reportContent, onValueChange } = useSelect()
	const isSelected = v === value

	useEffect(() => {
		reportContent(value, children)
	}, [value, children, reportContent])

	return (
		<motion.div
			onClick={() => onValueChange?.(isSelected ? undefined : value)}
			className={cn(
				"relative flex w-full text-muted-foreground cursor-pointer select-none items-center rounded-md py-2 px-3 text-sm outline-none transition-colors duration-200 ease-in-out font-medium hover:bg-muted",
				isSelected && "bg-muted font-semibold",
				className
			)}
			role="option"
			{...props}>
			{children}
		</motion.div>
	)
}

type SelectMessageErrorProps = {
	message?: string
} & React.ComponentProps<typeof motion.p>

export function SelectMessageError({ message, className, ...props }: SelectMessageErrorProps) {
	return message ? (
		<motion.p
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, ease: "easeOut" }}
			className={cn("text-left w-full my-3 text-destructive text-xs", className)}
			{...props}>
			{message}
		</motion.p>
	) : null
}

type SelectTitleProps = {
	title: string
} & React.ComponentProps<typeof motion.span>

export function SelectTitle({ title, className, ...props }: SelectTitleProps) {
	const { uniqueId } = useSelect()
	return (
		<motion.span
			layout="position"
			layoutId={`select-title-${uniqueId}`}
			className={cn("text-xl font-medium text-primary", className)}
			{...props}>
			{title}
		</motion.span>
	)
}

type SelectTriggerProps = {
	children?: React.ReactNode
	asChild?: boolean
	label: string
	error?: boolean
	placeholder?: string
	classValue?: string
	classLabel?: string
} & React.ComponentProps<typeof motion.div>

export function SelectTrigger({
	children,
	className,
	classLabel,
	classValue,
	label,
	error,
	placeholder,
	asChild = false,
	...props
}: SelectTriggerProps) {
	const { isOpen, open, close, uniqueId } = useSelect()

	const handleToggle = (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
		if (isOpen) close()
		else open()
	}

	if (asChild && isValidElement(children)) {
		const MotionComponent = motion.create(children.type as React.ForwardRefExoticComponent<any>)
		const childProps = children.props as Record<string, unknown>

		return (
			<MotionComponent
				{...childProps}
				onClick={handleToggle}
				layoutId={`select-trigger-${uniqueId}`}
				className={cn("w-full cursor-pointer", childProps.className!, className)}
				key={uniqueId}
				aria-expanded={isOpen}
				aria-controls={`select-content-${uniqueId}`}
			/>
		)
	}

	return (
		<motion.div key={uniqueId} layoutId={`select-trigger-${uniqueId}`} onClick={handleToggle} aria-expanded={isOpen}>
			<motion.div
				animate={error ? { x: [0, -24, 24, -24, 24, 0] } : { x: 0 }}
				transition={{ duration: 0.6, ease: "easeInOut" }}
				className={cn(
					"relative flex flex-col gap-1 bg-card shadow-[0_0_0_.5px_#0000000d,0_.5px_2.5px_#00000029] dark:shadow-[0_0_0_.5px_#2d372d,0_.5px_2.5px_#00000029] p-4 h-18 rounded-xl w-sm hover:ring-2 hover:ring-input transition-all duration-200 ease-in-out cursor-pointer",
					className,
					{ "ring-2 ring-destructive hover:ring-destructive": error }
				)}
				{...props}>
				<SelectTitle title={label} className={cn("text-xs text-label", classLabel)} />
				<SelectValue
					placeholder={placeholder ?? "Seleccionar"}
					className={cn(
						"absolute inset-0 px-4 pt-4.5 focus:outline-none text-foreground text-sm text-ellipsis pointer-events-none",
						classValue
					)}
				/>
			</motion.div>
		</motion.div>
	)
}

type SelectGroupProps = {
	children: React.ReactNode
} & React.ComponentProps<typeof motion.section>

export function SelectGroup({ children, className, ...props }: SelectGroupProps) {
	return (
		<motion.section className={cn("flex flex-col gap-1 mt-2", className)} {...props}>
			{children}
		</motion.section>
	)
}
