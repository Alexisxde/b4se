import { ANALYTICS_CATEGORIES } from "@/utils/query-key"
import { useQuery } from "@tanstack/react-query"
import type { AnalyticsCategory } from "../analytics"
import { getAnalyticsCategories } from "../services/categories"

export function useAnalyticsCategories({ month, year }: { month: number; year: number }) {
	return useQuery<AnalyticsCategory[]>({
		queryKey: [...ANALYTICS_CATEGORIES, { month, year }],
		queryFn: () => getAnalyticsCategories({ month, year }),
		enabled: !!month && !!year
	})
}
