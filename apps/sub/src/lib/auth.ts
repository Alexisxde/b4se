import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { userLoginSchema } from "../features/auth/schemas/login"
import api from "./axios"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const { success, data } = userLoginSchema.safeParse(credentials)
        if (!success) return null
        const { email, password } = data

        try {
          const loginResponse = await api.post("/api/auth/login", { email, password })
          if (!loginResponse.data?.success) return null
          const {
            data: { data }
          } = loginResponse
          const { accessToken, refreshToken } = data
          const meResponse = await api.get("/api/auth/me", {
            headers: { Cookie: `token=${accessToken}; refreshToken=${refreshToken}` }
          })

          if (!meResponse.data?.success || !meResponse.data?.data) return null
          const userData = meResponse.data.data
          console.log(meResponse.data)

          return {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            image: userData.avatar?.url ?? null,
            role: userData.role
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
        // En next-auth v5 beta la propagación automática no es confiable,
        // hay que copiar todos los campos explícitamente
        token.id = user.id
        token.name = user.name ?? token.name
        token.email = user.email ?? token.email
        token.picture = user.image ?? token.picture
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      // Reconstruir session.user explícitamente desde el token
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          name: token.name,
          email: token.email,
          image: token.picture,
          role: token.role as string
        }
      }
    }
  },
  session: { strategy: "jwt" },
  pages: { signIn: "/" }
})
