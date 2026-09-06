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

  const startOfMonth = new Date(y, m, 1)
  const endOfMonth = new Date(y, m + 1, 0, 23, 59, 59, 999)

  try {
    const history = await prisma.historySubscription.findMany({
      where: {
        subscription: { userId },
        startDate: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      select: {
        startDate: true,
        amount: true
      }
    })

    const dailyExpenses: Record<number, number> = {}
    for (const h of history) {
      const day = h.startDate.getDate()
      dailyExpenses[day] = (dailyExpenses[day] || 0) + h.amount
    }

    const formattedData = Object.entries(dailyExpenses)
      .map(([day, actual]) => ({
        day: Number(day),
        actual
      }))
      .sort((a, b) => a.day - b.day)

    return NextResponse.json(formattedData, { status: OK })
  } catch (_) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: INTERNAL_SERVER_ERROR })
  }
}
