import { ANALYTICS_SUBSCRIPTIONS } from "@/utils/query-key"
import { useQuery } from "@tanstack/react-query"
import type { AnalyticsSubscription } from "../analytics"
import { getAnalyticsSubscriptions } from "../services/subscriptions"

export function useAnalyticsSubscriptions({ month, year }: { month: number; year: number }) {
	return useQuery<AnalyticsSubscription[]>({
		queryKey: [...ANALYTICS_SUBSCRIPTIONS, { month, year }],
		queryFn: () => getAnalyticsSubscriptions({ month, year }),
		enabled: !!month && !!year
	})
}
