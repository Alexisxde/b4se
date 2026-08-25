import api from "@/lib/axios"
import type { Service } from "../service"

export async function getServices(search?: string): Promise<Service[]> {
	const res = await api.get("/api/services", {
		params: { search }
	})
	return res.data
}
