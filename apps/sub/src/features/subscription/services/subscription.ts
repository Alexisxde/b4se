import api from "@/lib/axios"
import type { CreateSubcription, Subcription } from "../subscription"

export async function createSubscription(data: CreateSubcription) {
  const res = await api.post("/api/subscriptions", data)
  return res.data
}

export async function renewSubscription(id: string) {
  const res = await api.post(`/api/subscriptions/${id}/renew`)
  return res.data
}

export async function getSubscriptions({ month, year }: { month: number; year: number }): Promise<Subcription[]> {
  const res = await api.get(`/api/subscriptions?month=${month}&year=${year}`)
  return res.data
}
