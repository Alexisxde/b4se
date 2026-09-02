import { ANALYTICS_EXPENSES_BEFORE_MONTH } from "@/utils/query-key"
import { useQuery } from "@tanstack/react-query"
import { getAnalyticsExpensesBeforeMonth } from "../services/expenses-before-month"
import type { AnalyticsExpenseBeforeMonth } from "../analytics"

export function useAnalyticsExpensesBeforeMonth({ month, year }: { month: number; year: number }) {
  return useQuery<AnalyticsExpenseBeforeMonth[]>({
    queryKey: [...ANALYTICS_EXPENSES_BEFORE_MONTH, { month, year }],
    queryFn: () => getAnalyticsExpensesBeforeMonth({ month, year }),
    enabled: !!year
  })
}
