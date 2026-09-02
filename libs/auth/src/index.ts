// Core NextAuth
export { authOptions } from "./core/auth-options"
export { getServerAuthSession } from "./core/session"

// API & Axios
export { authApi } from "./api/auth-client"
export { default as authApiClient, getAuthApiBaseUrl } from "./api/axios"

// Schemas
export {
  loginUserSchema,
  registerUserSchema,
  updateUserSchema,
  type LoginCredentials,
  type RegisterCredentials,
  type UpdateCredentials
} from "./schemas/auth-schema"

// Components & Providers
export { AuthSessionProvider, default as SessionProvider } from "./components/session-provider"
export type { AuthSessionProviderProps } from "./components/session-provider"

// Middleware
export { createAuthMiddleware } from "./middleware/auth-middleware"
export type { CreateAuthMiddlewareOptions } from "./middleware/auth-middleware"

// Types
export type * from "./types"

// Client helpers
export { getSession, signIn, signOut, useSession } from "next-auth/react"
