import api from "@/lib/axios"
import type { Category } from "../suscription"

export async function getCategories(): Promise<Category[]> {
  const res = await api.get("/api/categories")
  return res.data
}
