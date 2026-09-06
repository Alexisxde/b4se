import prisma from "@/lib/prisma"
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, OK, UNAUTHORIZED } from "@/utils/http-code"
import { getServerAuthSession } from "@b4se/auth"
import { NextResponse } from "next/server"

export async function getSubscriptions(request: Request) {
  const session = await getServerAuthSession()
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: UNAUTHORIZED })
  if (!session.user) return NextResponse.json({ error: "No autorizado." }, { status: UNAUTHORIZED })
  const userId = session.user.id

  const { searchParams } = new URL(request.url)
  const month = searchParams.get("month")
  const year = searchParams.get("year")

  if (!month || !year) return NextResponse.json({ error: "Mes y año son requeridos." }, { status: BAD_REQUEST })
  const m = Number(month)
  const y = Number(year)

  if (Number.isNaN(m) || Number.isNaN(y))
    return NextResponse.json({ error: "Mes y año deben ser números." }, { status: BAD_REQUEST })
  const startOfMonth = new Date(y, m, 1)
  const endOfMonth = new Date(y, m + 1, 0, 23, 59, 59, 999)

  try {
    const subcriptions = await prisma.subscription.findMany({
      where: {
        userId,
        history: { some: { AND: [{ startDate: { lte: endOfMonth } }, { endDate: { gte: startOfMonth } }] } }
      },
      select: {
        id: true,
        notificationSent: true,
        category: { select: { id: true, name: true } },
        service: { select: { id: true, name: true, logo: true } },
        history: {
          where: { AND: [{ startDate: { lte: endOfMonth } }, { endDate: { gte: startOfMonth } }] },
          select: { id: true, amount: true, period: true, startDate: true, endDate: true, note: true }
        }
      }
    })
    return NextResponse.json(subcriptions, { status: OK })
  } catch (_) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: INTERNAL_SERVER_ERROR })
  }
}
