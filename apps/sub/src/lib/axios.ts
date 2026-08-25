import axios, { type AxiosInstance } from "axios"

export const getAppBaseUrl = () => process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export const appClient: AxiosInstance = axios.create({
  baseURL: getAppBaseUrl(),
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true
})

export default appClient
