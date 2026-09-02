import api from "@/lib/axios"
import type { AnalyticsCategory } from "../analytics"

export async function getAnalyticsCategories({
  month,
  year
}: {
  month: number
  year: number
}): Promise<AnalyticsCategory[]> {
  const res = await api.get(`/api/analytics/categories?month=${month}&year=${year}`)
  return res.data
}
