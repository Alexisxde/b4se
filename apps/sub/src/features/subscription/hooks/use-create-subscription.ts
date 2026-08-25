"use client"
import { createSubscription } from "@/features/subscription/services/subcriptions"
import { SUBCRIPTIONS } from "@/utils/query-key"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { sileo } from "sileo"
import type { CreateSubcription } from "../suscription"

export default function useCreateSubscription() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (data: CreateSubcription) => createSubscription(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: SUBCRIPTIONS })
			sileo.success({
				title: "Suscripción creada",
				description: "Tu suscripción ha sido guardada correctamente."
			})
		},
		onError: (error: any) => {
			const message = error.response?.data?.error || "Failed to create subscription. Please try again."
			sileo.error({ title: "Error", description: message })
		}
	})
}
