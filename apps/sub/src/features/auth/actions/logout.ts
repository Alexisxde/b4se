"use server"
import { signOut } from "@/lib/auth"
import api from "@/lib/axios"
import { cookies } from "next/headers"

export async function logout() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  const refreshToken = cookieStore.get("refreshToken")?.value

  const cookieHeader = [token && `token=${token}`, refreshToken && `refreshToken=${refreshToken}`]
    .filter(Boolean)
    .join("; ")

  try {
    await api.post(
      "/api/auth/logout",
      {},
      { headers: cookieHeader ? { Cookie: cookieHeader } : undefined }
    )
  } catch {
    // Si falla el logout del api, continuamos igual con el signOut de next-auth
  }

  await signOut({ redirectTo: "/" })
}
