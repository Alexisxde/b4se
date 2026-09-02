import type { ApiResponse, AuthTokens, AuthUser, LoginCredentials, RegisterCredentials } from "../types"
import authApiClient, { getAuthApiBaseUrl } from "./axios"

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthTokens>> => {
    const response = await authApiClient.post<ApiResponse<AuthTokens>>("/api/auth/login", credentials, {
      baseURL: getAuthApiBaseUrl()
    })
    return response.data
  },
  register: async (data: RegisterCredentials): Promise<ApiResponse<Omit<AuthUser, "avatar">>> => {
    const response = await authApiClient.post<ApiResponse<Omit<AuthUser, "avatar">>>("/api/auth/register", data, {
      baseURL: getAuthApiBaseUrl()
    })
    return response.data
  },
  getMe: async (cookieHeader?: string): Promise<ApiResponse<AuthUser>> => {
    const response = await authApiClient.get<ApiResponse<AuthUser>>("/api/auth/me", {
      baseURL: getAuthApiBaseUrl(),
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined
    })
    return response.data
  },
  logout: async (cookieHeader?: string): Promise<ApiResponse<null>> => {
    const response = await authApiClient.post<ApiResponse<null>>(
      "/api/auth/logout",
      {},
      {
        baseURL: getAuthApiBaseUrl(),
        headers: cookieHeader ? { Cookie: cookieHeader } : undefined
      }
    )
    return response.data
  },
  refreshToken: async (refreshTokenCookie?: string): Promise<ApiResponse<AuthTokens>> => {
    const response = await authApiClient.post<ApiResponse<AuthTokens>>(
      "/api/auth/refresh",
      {},
      {
        baseURL: getAuthApiBaseUrl(),
        headers: refreshTokenCookie ? { Cookie: refreshTokenCookie } : undefined
      }
    )
    return response.data
  }
}
