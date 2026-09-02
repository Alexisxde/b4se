export interface AnalyticsSubscription {
  id: string
  name: string
  logo: string | null
  amount: number
  period: "month" | "year"
  startDate: string
  endDate: string
}

export interface AnalyticsCategory {
  name: string
  logo: string
  value: number
  amount: number
  pct: string
}

export interface AnalyticsPayment {
  name: string
  logo: string | null
  value: number
  amount: number
  pct: string
}

export interface AnalyticsExpenseMonth {
  day: number
  actual: number
}

export interface AnalyticsExpenseBeforeMonth {
  label: string
  actual: number
  month: number
  year: number
}
