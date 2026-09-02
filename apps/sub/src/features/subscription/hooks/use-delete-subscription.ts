import { SUBCRIPTIONS } from "@/utils/query-key"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteSubscription } from "../services/subcriptions-details"

export function useDeleteSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBCRIPTIONS })
    }
  })
}
