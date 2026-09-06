"use client"
import { Puzzle } from "lucide-react"
import { motion } from "motion/react"
import { Cell, Pie, PieChart } from "recharts"
import { useAnalyticsCategories } from "../hooks/use-analytics-categories"
import { CardEmptyState } from "./analytics-card-empty"

type Props = { month: number; year: number }

export default function AnalyticsCardCategory({ month, year }: Props) {
  const { data = [], isLoading } = useAnalyticsCategories({ month, year })

  if (isLoading) return <article className="rounded-4xl bg-card p-6 min-h-53 animate-pulse" />

  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <motion.article
      initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.3, delayChildren: 0.2, staggerChildren: 0.1 }}
      className="rounded-4xl bg-card p-6 min-h-53 shadow-md flex flex-col">
      <header className="flex items-center gap-2 mb-2">
        <Puzzle className="text-primary size-5" />
        <h3 className="text-primary font-medium text-base">Categorías</h3>
      </header>
      {data.length === 0 ? (
        <CardEmptyState />
      ) : (
        <>
          <section className="relative flex w-full items-center justify-center">
            <PieChart width={250} height={130}>
              <Pie
                data={data}
                cx={120}
                cy={118}
                startAngle={180}
                endAngle={0}
                innerRadius={74}
                outerRadius={104}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
                cornerRadius={6}
                labelLine={false}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} style={{ fill: `var(--chart-${index + 1})` }} stroke="transparent" />
                ))}
              </Pie>
            </PieChart>
            <div className="absolute bottom-2 flex flex-col items-center">
              <span className="text-primary text-[32px] font-semibold leading-none tracking-tight">{total}</span>
              <span className="text-muted-foreground text-xs mt-0.5">Suscripciones</span>
            </div>
          </section>
          <footer className="mt-2 flex flex-col gap-3">
            {data.map((item, index) => {
              return (
                <div key={item.name} className="text-muted-foreground flex items-center gap-2.5">
                  <span
                    className="size-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: `var(--chart-${index + 1})` }}
                  />
                  <div
                    className="text-muted-foreground [&_svg]:size-4 flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: item.logo || "" }}
                  />
                  <span className="flex-1 text-muted-foreground text-[13px]">{item.name}</span>
                  <span className="text-primary text-[13px] font-medium tabular-nums border-r pr-4 border-outline">
                    ${item.amount}
                  </span>
                  <span className="text-muted-foreground text-[12px] tabular-nums w-7 text-right">{item.pct}</span>
                </div>
              )
            })}
          </footer>
        </>
      )}
    </motion.article>
  )
}
