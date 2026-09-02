"use client"
import { Wallet } from "lucide-react"
import { motion } from "motion/react"
import { Cell, Pie, PieChart } from "recharts"
import { useAnalyticsPayments } from "../hooks/use-analytics-payments"
import { CardEmptyState } from "./analytics-card-empty"

type Props = { month: number; year: number }

export default function AnalyticsCardPayments({ month, year }: Props) {
  const { data = [], isLoading } = useAnalyticsPayments({ month, year })

  if (isLoading) return <article className="rounded-4xl bg-card p-6 min-h-72 w-full animate-pulse" />

  const total = data.reduce((s, d) => s + d.amount, 0)

  return (
    <motion.article
      initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.3, delayChildren: 0.2, staggerChildren: 0.1 }}
      className="rounded-4xl bg-card p-6 space-y-3 flex-1 shadow-md min-h-53 h-fit max-h-72 max-w-full lg:max-w-md">
      <header className="flex items-center gap-2">
        <Wallet className="text-primary size-5" />
        <h3 className="text-primary font-medium text-base">Métodos de pago</h3>
      </header>
      {data.length === 0 ? (
        <CardEmptyState />
      ) : (
        <section className="relative flex w-full items-center gap-4 justify-between">
          <div className="flex flex-col gap-3">
            {data.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2.5">
                <span
                  className="size-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: `var(--chart-${index + 1})` }}
                />
                <div
                  className="[&_svg]:size-4 flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: item.logo || "" }}
                />
                <span className="flex-1 text-muted-foreground text-[13px]">{item.name}</span>
                <span className="text-primary font-medium text-[13px] tabular-nums border-r px-4 border-border">
                  ${item.amount}
                </span>
                <span className="text-muted-foreground text-[12px] tabular-nums w-7 text-right">{item.pct}</span>
              </div>
            ))}
          </div>
          <div className="absolute -top-6 right-0">
            <PieChart width={150} height={150}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={46}
                outerRadius={66}
                paddingAngle={4}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                strokeWidth={0}
                cornerRadius={6}
                labelLine={false}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} style={{ fill: `var(--chart-${index + 1})` }} stroke="transparent" />
                ))}
              </Pie>
            </PieChart>
            <div className="z-10 flex flex-col items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="text-primary text-xl font-semibold leading-none tracking-tight">${total}</span>
              <span className="text-muted-foreground text-[11px] mt-0.5">Gastados</span>
            </div>
          </div>
        </section>
      )}
    </motion.article>
  )
}
