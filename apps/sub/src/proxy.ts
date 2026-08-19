import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

const PUBLIC_PATHS = ["/"]
const AUTH_PREFIX = "/api/auth"

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session

  const isPublicPath = PUBLIC_PATHS.includes(nextUrl.pathname)
  const isAuthApiRoute = nextUrl.pathname.startsWith(AUTH_PREFIX)

  if (isAuthApiRoute) return NextResponse.next()
  if (!isPublicPath && !isLoggedIn) return NextResponse.redirect(new URL("/", nextUrl))

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
}
