import { getServerSession } from "next-auth"
import { authOptions } from "./auth-options"

/**
 * Helper to get the authenticated server session in Next.js Server Components, API routes or Server Actions.
 */
export const getServerAuthSession = () => getServerSession(authOptions)
