import api from "@/lib/axios"
import type { Subcription } from "../suscription"

export async function getSubscriptionById(id: string): Promise<Subcription> {
	const res = await api.get(`/api/subscriptions/${id}`)
	return res.data
}

export async function deleteSubscription(id: string): Promise<void> {
	await api.delete(`/api/subscriptions/${id}`)
}
