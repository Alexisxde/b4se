import { getToken } from "next-auth/jwt"
import { type NextRequest, NextResponse } from "next/server"

export interface CreateAuthMiddlewareOptions {
  publicPaths?: string[]
  authPrefix?: string
  signInUrl?: string
  secret?: string
}

export function createAuthMiddleware(options: CreateAuthMiddlewareOptions = {}) {
  const {
    publicPaths = ["/"],
    authPrefix = "/api/auth",
    signInUrl = "/",
    secret = process.env.NEXTAUTH_SECRET || "default_nextauth_secret_for_development_only"
  } = options

  return async function authMiddleware(req: NextRequest) {
    const { nextUrl } = req
    const isPublicPath = publicPaths.includes(nextUrl.pathname)
    const isAuthApiRoute = nextUrl.pathname.startsWith(authPrefix)

    if (isAuthApiRoute) return NextResponse.next()
    const token = await getToken({ req, secret })
    const isLoggedIn = !!token
    if (!isPublicPath && !isLoggedIn) return NextResponse.redirect(new URL(signInUrl, nextUrl))
    return NextResponse.next()
  }
}
