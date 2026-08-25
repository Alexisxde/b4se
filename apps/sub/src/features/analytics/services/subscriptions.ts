import api from "@/lib/axios"
import type { AnalyticsSubscription } from "../analytics"

export async function getAnalyticsSubscriptions({
	month,
	year
}: {
	month: number
	year: number
}): Promise<AnalyticsSubscription[]> {
	const res = await api.get(`/api/analytics/subscriptions?month=${month}&year=${year}`)
	return res.data
}
