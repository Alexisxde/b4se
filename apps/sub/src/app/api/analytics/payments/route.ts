import prisma from "@/lib/prisma"
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, OK, UNAUTHORIZED } from "@/utils/http-code"
import { getServerAuthSession } from "@b4se/auth"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
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

  const startOfMonth = new Date(y, m + 1, 1)
  const endOfMonth = new Date(y, m + 1, 0, 23, 59, 59, 999)

  try {
    const history = await prisma.historySubscription.findMany({
      where: {
        subscription: { userId },
        AND: [{ startDate: { lte: endOfMonth } }, { endDate: { gte: startOfMonth } }]
      },
      include: {
        paymentMethod: true
      }
    })

    const paymentStats: Record<string, { name: string; logo: string | null; value: number; amount: number }> = {}
    let totalAmount = 0

    for (const h of history) {
      const pm = h.paymentMethod
      if (!paymentStats[pm.id]) {
        paymentStats[pm.id] = {
          name: pm.name,
          logo: pm.logo,
          value: 0,
          amount: 0
        }
      }

      paymentStats[pm.id].value += 1
      paymentStats[pm.id].amount += h.amount
      totalAmount += h.amount
    }

    const formattedStats = Object.values(paymentStats).map((stat) => ({
      ...stat,
      pct: totalAmount > 0 ? `${Math.round((stat.amount / totalAmount) * 100)}%` : "0%"
    }))

    const format = formattedStats.toSorted((a, b) => b.amount - a.amount)
    return NextResponse.json(format, { status: OK })
  } catch (_) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: INTERNAL_SERVER_ERROR })
  }
}
