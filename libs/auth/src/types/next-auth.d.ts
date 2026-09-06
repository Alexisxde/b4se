import type { DefaultSession, DefaultUser } from "next-auth"
import type { DefaultJWT } from "next-auth/jwt"

interface AuthUserPayload {
  id: string
  name?: string | null
  email?: string | null
  role?: string | null
  image?: string | null
}

declare module "next-auth" {
  interface User extends DefaultUser {
    user?: AuthUserPayload
    accessToken?: string
    refreshToken?: string
  }

  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
    accessToken?: string
    refreshToken?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    user: AuthUserPayload
    accessToken?: string
    refreshToken?: string
  }
}

declare module "next-auth/adapters" {
  interface AdapterUser {
    id: string
    role: string
  }
}
