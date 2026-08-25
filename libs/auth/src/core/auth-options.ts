import { authApi } from "@/api/auth-client"
import { loginUserSchema } from "@/schemas/auth-schema"
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsed = loginUserSchema.safeParse(credentials)
        if (!parsed.success) {
          return null
        }

        const { email, password } = parsed.data

        try {
          // 1. Authenticate with Express api-auth
          const loginRes = await authApi.login({ email, password })
          if (!loginRes?.success || !loginRes?.data) {
            return null
          }

          const { token, refreshToken } = loginRes.data
          const cookieHeader = [token && `token=${token}`, refreshToken && `refreshToken=${refreshToken}`]
            .filter(Boolean)
            .join("; ")

          const meRes = await authApi.getMe(cookieHeader)
          if (!meRes?.success || !meRes?.data) {
            return null
          }

          const userData = meRes.data

          return {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            image: userData.avatar?.url ?? null
          }
        } catch {
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.picture = user.image
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.image = (token.picture as string) || null
        session.user.role = token.role as string
      }
      return session
    }
  },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET || "default_nextauth_secret_for_development_only",
  pages: { signIn: "/", error: "/" }
}
