"use client"
import { monthStringLong } from "@/utils/month-string"
import { DollarSign } from "lucide-react"
import { motion } from "motion/react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useAnalyticsExpensesBeforeMonth } from "../hooks/use-analytics-expenses-before-month"
import { CardEmptyState } from "./analytics-card-empty"

type Props = { month: number; year: number }

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; name: string }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const actual = payload.find((p) => p.name === "actual")
    if (!actual) return null

    return (
      <div className="flex items-center gap-1 rounded-lg bg-card px-3 py-2 shadow-md border border-border">
        <p className="text-xs font-medium text-muted-foreground">{label}:</p>
        <p className="text-xs font-semibold">${actual.value.toFixed(2)}</p>
      </div>
    )
  }
  return null
}

export default function AnalyticsCardExpenses({ month, year }: Props) {
  const { data: monthsData = [], isLoading } = useAnalyticsExpensesBeforeMonth({ month, year })

  if (isLoading) return <article className="rounded-4xl bg-card p-6 min-h-53 w-full animate-pulse" />

  const lastMonth = monthsData[monthsData.length - 1] || { actual: 0 }
  const hasData = monthsData.some((d) => d.actual > 0)

  return (
    <motion.article
      initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.3, delayChildren: 0.2, staggerChildren: 0.1 }}
      className="flex flex-col bg-card rounded-4xl p-6 shadow-md min-h-64">
      <header className="flex items-center gap-2 mb-3">
        <DollarSign className="text-primary size-5" />
        <h3 className="text-primary font-medium text-base">Últimos 6 meses</h3>
      </header>
      {!hasData ? (
        <CardEmptyState />
      ) : (
        <>
          <p className="text-4xl font-semibold text-primary flex items-baseline gap-0.5">
            ${lastMonth.actual.toFixed(2)}
            <span className="text-sm text-muted-foreground">en {monthStringLong(month)}</span>
          </p>
          <section className="w-full flex-1 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  tickFormatter={(v) => `${v}`}
                  interval={0}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickFormatter={(v) => `$${v}`}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--muted)" }} />
                <Bar
                  dataKey="actual"
                  radius={[6, 6, 0, 0]}
                  fill="var(--chart-4)"
                  activeBar={{ fill: "var(--chart-5)" }}
                />
              </BarChart>
            </ResponsiveContainer>
          </section>
        </>
      )}
    </motion.article>
  )
}
