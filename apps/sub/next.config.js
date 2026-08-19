//@ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const authApiUrl = process.env.AUTH_API_URL
    return [
      {
        source: "/api/auth/register",
        destination: `${authApiUrl}/api/auth/register`
      },
      {
        source: "/api/auth/login",
        destination: `${authApiUrl}/api/auth/login`
      },
      {
        source: "/api/auth/me",
        destination: `${authApiUrl}/api/auth/me`
      },
      {
        source: "/api/auth/logout",
        destination: `${authApiUrl}/api/auth/logout`
      },
      {
        source: "/api/auth/refresh",
        destination: `${authApiUrl}/api/auth/refresh`
      }
    ]
  }
}

module.exports = nextConfig
