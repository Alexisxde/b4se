import { useQuery } from "@tanstack/react-query"
import { CATEGORIES } from "@/utils/query-key"
import { getCategories } from "../services/categories"

export function useSubscriptionCategory() {
	return useQuery({
		queryKey: CATEGORIES,
		queryFn: getCategories
	})
}
