import { SUBCRIPTIONS } from "@/utils/query-key"
import { useQuery } from "@tanstack/react-query"
import { getSubscriptionById } from "../services/subcriptions-details"

export function useSubscriptionDetails(id: string | null) {
	return useQuery({
		queryKey: [...SUBCRIPTIONS, id],
		queryFn: () => getSubscriptionById(id as string),
		enabled: !!id
	})
}
