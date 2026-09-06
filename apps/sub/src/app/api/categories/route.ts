import prisma from "@/lib/prisma"
import { INTERNAL_SERVER_ERROR, OK, UNAUTHORIZED } from "@/utils/http-code"
import { getServerAuthSession } from "@b4se/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(_request: NextRequest) {
  const session = await getServerAuthSession()
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: UNAUTHORIZED })
  if (!session.user) return NextResponse.json({ error: "No autorizado." }, { status: UNAUTHORIZED })

  try {
    const categories = await prisma.category.findMany({
      select: { id: true, name: true, logo: true },
      orderBy: { createdAt: "asc" }
    })
    return NextResponse.json(categories, { status: OK })
  } catch (_) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: INTERNAL_SERVER_ERROR })
  }
}
