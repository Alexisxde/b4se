import { SUBCRIPTIONS } from "@/utils/query-key"
import { useQuery } from "@tanstack/react-query"
import { getSubscriptions } from "../services/subcriptions"
import type { Subcription } from "../suscription"

export function useSubscriptions({ month, year }: { month: number; year: number }) {
  return useQuery<Subcription[]>({
    queryKey: [...SUBCRIPTIONS, { month, year }],
    queryFn: () => getSubscriptions({ month, year }),
    enabled: !!month && !!year
  })
}
