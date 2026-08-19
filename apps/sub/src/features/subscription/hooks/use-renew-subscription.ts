import { SUBCRIPTIONS } from "@/utils/query-key"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { sileo } from "sileo"
import { renewSubscription } from "../services/subscription"

export const useRenewSubscription = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => renewSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBCRIPTIONS })
      sileo.success({
        title: "Suscripción renovada",
        description: "La suscripción se ha renovado correctamente."
      })
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || "Error al renovar la suscripción."
      sileo.error({
        title: "Error",
        description: message
      })
    }
  })
}
