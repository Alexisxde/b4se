import { ANALYTICS_EXPENSES_MONTH } from "@/utils/query-key"
import { useQuery } from "@tanstack/react-query"
import { getAnalyticsExpensesMonth } from "../services/expenses-month"
import type { AnalyticsExpenseMonth } from "../analytics"

export function useAnalyticsExpensesMonth({ month, year }: { month: number; year: number }) {
	return useQuery<AnalyticsExpenseMonth[]>({
		queryKey: [...ANALYTICS_EXPENSES_MONTH, { month, year }],
		queryFn: () => getAnalyticsExpensesMonth({ month, year }),
		enabled: !!year
	})
}
