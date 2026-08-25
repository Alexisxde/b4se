import { ANALYTICS_PAYMENTS } from "@/utils/query-key"
import { useQuery } from "@tanstack/react-query"
import { getAnalyticsPayments } from "../services/payments"
import type { AnalyticsPayment } from "../analytics"

export function useAnalyticsPayments({ month, year }: { month: number; year: number }) {
	return useQuery<AnalyticsPayment[]>({
		queryKey: [...ANALYTICS_PAYMENTS, { month, year }],
		queryFn: () => getAnalyticsPayments({ month, year }),
		enabled: !!year
	})
}
