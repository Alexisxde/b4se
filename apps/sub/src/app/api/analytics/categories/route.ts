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
    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId,
        history: { some: { AND: [{ startDate: { lte: endOfMonth } }, { endDate: { gte: startOfMonth } }] } }
      },
      include: {
        category: true,
        history: {
          where: { AND: [{ startDate: { lte: endOfMonth } }, { endDate: { gte: startOfMonth } }] },
          select: { amount: true }
        }
      }
    })

    const categoryStats: Record<string, { name: string; logo: string; value: number; amount: number }> = {}
    let totalSubscriptions = 0

    for (const sub of subscriptions) {
      const category = sub.category
      const amount = sub.history.reduce((sum, h) => sum + h.amount, 0)

      if (!categoryStats[category.id]) {
        categoryStats[category.id] = {
          name: category.name,
          logo: category.logo,
          value: 0,
          amount: 0
        }
      }

      categoryStats[category.id].value += 1
      categoryStats[category.id].amount += amount
      totalSubscriptions += 1
    }

    const formattedStats = Object.values(categoryStats).map((stat) => ({
      ...stat,
      pct: totalSubscriptions > 0 ? `${Math.round((stat.value / totalSubscriptions) * 100)}%` : "0%"
    }))

    const format = formattedStats.toSorted((a, b) => b.amount - a.amount)
    return NextResponse.json(format, { status: OK })
  } catch (_) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: INTERNAL_SERVER_ERROR })
  }
}
