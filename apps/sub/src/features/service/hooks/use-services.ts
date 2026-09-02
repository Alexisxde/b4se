"use client"
import { SERVICES } from "@/utils/query-key"
import { useQuery } from "@tanstack/react-query"
import { getServices } from "../services/service"

export function useServices(search?: string) {
  return useQuery({
    queryKey: [...SERVICES, search],
    queryFn: () => getServices(search),
    enabled: true
  })
}
