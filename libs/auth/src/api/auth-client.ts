import authApiClient, { getAuthApiBaseUrl } from "./axios"
import type { ApiResponse, AuthTokens, AuthUser, LoginCredentials, RegisterCredentials } from "../types"

export const authApi = {
  /**
   * Log in user via Express api-auth
   */
  login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthTokens>> => {
    const response = await authApiClient.post<ApiResponse<AuthTokens>>(
      "/api/auth/login",
      credentials,
      {
        baseURL: getAuthApiBaseUrl()
      }
    )
    return response.data
  },

  /**
   * Register user via Express api-auth
   */
  register: async (data: RegisterCredentials): Promise<ApiResponse<Omit<AuthUser, "avatar">>> => {
    const response = await authApiClient.post<ApiResponse<Omit<AuthUser, "avatar">>>(
      "/api/auth/register",
      data,
      {
        baseURL: getAuthApiBaseUrl()
      }
    )
    return response.data
  },

  /**
   * Get authenticated user profile via Express api-auth (/api/auth/me)
   */
  getMe: async (cookieHeader?: string): Promise<ApiResponse<AuthUser>> => {
    const response = await authApiClient.get<ApiResponse<AuthUser>>(
      "/api/auth/me",
      {
        baseURL: getAuthApiBaseUrl(),
        headers: cookieHeader ? { Cookie: cookieHeader } : undefined
      }
    )
    return response.data
  },

  /**
   * Logout user via Express api-auth
   */
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

  /**
   * Refresh JWT token via Express api-auth
   */
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
