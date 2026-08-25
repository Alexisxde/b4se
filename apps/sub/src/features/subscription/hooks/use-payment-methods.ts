import { PAYMENT_METHODS } from "@/utils/query-key"
import { useQuery } from "@tanstack/react-query"
import { getPaymentMethods } from "../services/payment-methods"
import type { PaymentMethod } from "../suscription"

export function useSubscriptionPaymentMethods() {
	return useQuery<PaymentMethod[]>({
		queryKey: PAYMENT_METHODS,
		queryFn: getPaymentMethods
	})
}
