export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  image: string | null
}

export interface AuthTokens {
  user: AuthUser
  token: string
  refreshToken: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string | null
}

export type { LoginCredentials, RegisterCredentials, UpdateCredentials } from "../schemas/auth-schema"
