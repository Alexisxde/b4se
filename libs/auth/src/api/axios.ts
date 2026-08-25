import axios, { type AxiosInstance } from "axios"

export const getAuthApiBaseUrl = () => process.env.AUTH_API_URL || "http://localhost:3001"

export const authApiClient: AxiosInstance = axios.create({
  baseURL: getAuthApiBaseUrl(),
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true
})

export default authApiClient
