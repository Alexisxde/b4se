import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { authApi } from "../api/auth-client"
import { loginUserSchema } from "../schemas/auth-schema"

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
        const { success, data } = loginUserSchema.safeParse(credentials)
        if (!success) return null
        const { email, password } = data

        try {
          const { success, data } = await authApi.login({ email, password })
          if (!success || !data) return null

          const {
            user: { id, name, role, image },
            token: accessToken,
            refreshToken
          } = data

          return {
            id,
            user: { id, name, email, role, image },
            accessToken,
            refreshToken
          }
        } catch {
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user: data }) {
      if (data?.user) {
        token.user = {
          id: data.user.id,
          name: data.user.name ?? null,
          email: data.user.email ?? null,
          role: data.user.role ?? null,
          image: data.user.image ?? null
        }
        token.accessToken = data.accessToken
        token.refreshToken = data.refreshToken
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.user.id as string
        session.user.name = token.user.name as string
        session.user.email = token.user.email as string
        session.user.image = (token.user.image as string) || null
        session.user.role = token.user.role as string
      }
      session.accessToken = token.accessToken as string
      session.refreshToken = token.refreshToken as string
      return session
    }
  },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/", error: "/" }
}
