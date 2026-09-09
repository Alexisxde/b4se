"use client"
import { useState } from "react"
import { useSubscriptions } from "../../subscription/hooks/use-subscriptions"
import AnalyticsCardCategory from "./analytics-card-category"
import AnalyticsCardExpenses from "./analytics-card-expenses"
import AnalyticsCardMonth from "./analytics-card-month"
import AnalyticsCardPayments from "./analytics-card-payments"
import AnalyticsCardServices from "./analytics-card-services"
import AnalyticsHeader from "./analytics-header"

export function Analytics() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const month = currentDate.getMonth()
  const year = currentDate.getFullYear()
  useSubscriptions({ month: month + 1, year })
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  return (
    <section className="pb-16 md:pb-6 p-6 space-y-4">
      <AnalyticsHeader month={month} year={year} prevMonth={prevMonth} nextMonth={nextMonth} />
      <main className="flex flex-col gap-3">
        <section className="flex flex-col lg:flex-row gap-3">
          <AnalyticsCardMonth month={month} year={year} />
          <AnalyticsCardPayments month={month} year={year} />
        </section>
        <section className="grid grid-cols-1 md:grid-cols-3 grid-rows-1 gap-3">
          <AnalyticsCardExpenses month={month} year={year} />
          <AnalyticsCardCategory month={month} year={year} />
          <AnalyticsCardServices month={month} year={year} />
        </section>
      </main>
    </section>
  )
}
