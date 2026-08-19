import axios from "axios"

export const api = axios.create({
  baseURL: process.env.AUTH_API_URL || process.env.NEXT_PUBLIC_AUTH_API_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001",
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true
})

export default api
