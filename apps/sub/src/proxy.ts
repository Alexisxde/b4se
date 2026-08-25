import { createAuthMiddleware } from "@b4se/auth"

export default createAuthMiddleware({
  publicPaths: ["/"],
  authPrefix: "/api/auth",
  signInUrl: "/"
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
}
