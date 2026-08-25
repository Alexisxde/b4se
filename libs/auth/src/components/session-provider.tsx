"use client"
import type { SessionProviderProps } from "next-auth/react"
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"
import type { ReactNode } from "react"

export interface AuthSessionProviderProps extends Omit<SessionProviderProps, "children"> {
  children: ReactNode
}

export function AuthSessionProvider({
  children,
  refetchInterval = 5 * 60,
  refetchOnWindowFocus = true,
  ...props
}: AuthSessionProviderProps) {
  return (
    <NextAuthSessionProvider refetchInterval={refetchInterval} refetchOnWindowFocus={refetchOnWindowFocus} {...props}>
      {children}
    </NextAuthSessionProvider>
  )
}

export default AuthSessionProvider
