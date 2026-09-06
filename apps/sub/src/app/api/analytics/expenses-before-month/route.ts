import prisma from "@/lib/prisma"
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, OK, UNAUTHORIZED } from "@/utils/http-code"
import { monthStringShort } from "@/utils/month-string"
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

  const endDate = new Date(y, m + 1, 0, 23, 59, 59, 999)
  const startDate = new Date(y, m - 5, 1)

  try {
    const history = await prisma.historySubscription.findMany({
      where: {
        subscription: { userId },
        startDate: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        startDate: true,
        amount: true
      }
    })

    const results = []
    for (let i = 0; i < 6; i++) {
      const currentTargetDate = new Date(y, m - 5 + i, 1)
      const currentMonth = currentTargetDate.getMonth()
      const currentYear = currentTargetDate.getFullYear()

      const monthlyTotal = history
        .filter((h) => h.startDate.getMonth() === currentMonth && h.startDate.getFullYear() === currentYear)
        .reduce((acc, curr) => acc + curr.amount, 0)

      results.push({
        label: monthStringShort(currentMonth),
        actual: monthlyTotal,
        month: currentMonth,
        year: currentYear
      })
    }

    return NextResponse.json(results, { status: OK })
  } catch (_) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: INTERNAL_SERVER_ERROR })
  }
}
