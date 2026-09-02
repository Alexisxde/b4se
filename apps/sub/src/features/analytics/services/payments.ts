import api from "@/lib/axios"
import type { AnalyticsPayment } from "../analytics"

export async function getAnalyticsPayments({
  month,
  year
}: {
  month: number
  year: number
}): Promise<AnalyticsPayment[]> {
  const res = await api.get(`/api/analytics/payments?month=${month}&year=${year}`)
  return res.data
}
