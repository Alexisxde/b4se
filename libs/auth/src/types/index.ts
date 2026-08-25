export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  avatar?: {
    id: string
    url: string
  } | null
}

export interface AuthTokens {
  token: string
  refreshToken: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string | null
}

export type { LoginCredentials, RegisterCredentials, UpdateCredentials } from "../schemas/auth-schema"
