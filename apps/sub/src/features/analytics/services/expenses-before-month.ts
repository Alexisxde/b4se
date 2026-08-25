import api from "@/lib/axios"
import type { AnalyticsExpenseBeforeMonth } from "../analytics"

export async function getAnalyticsExpensesBeforeMonth({
	month,
	year
}: {
	month: number
	year: number
}): Promise<AnalyticsExpenseBeforeMonth[]> {
	const res = await api.get(`/api/analytics/expenses-before-month?month=${month}&year=${year}`)
	return res.data
}
