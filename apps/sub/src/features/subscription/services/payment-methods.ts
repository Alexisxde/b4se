import api from "@/lib/axios"
import type { PaymentMethod } from "../suscription"

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
	const res = await api.get("/api/payment-methods")
	return res.data
}
