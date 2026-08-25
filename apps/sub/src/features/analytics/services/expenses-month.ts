import api from "@/lib/axios"
import type { AnalyticsExpenseMonth } from "../analytics"

export async function getAnalyticsExpensesMonth({
	month,
	year
}: {
	month: number
	year: number
}): Promise<AnalyticsExpenseMonth[]> {
	const res = await api.get(`/api/analytics/expenses-month?month=${month}&year=${year}`)
	return res.data
}
