import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { BAD_REQUEST, CREATED, INTERNAL_SERVER_ERROR, NOT_FOUND, UNAUTHORIZED } from "@/utils/http-code"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const userId = session?.user.id
  if (!userId) return NextResponse.json({ error: "No autorizado." }, { status: UNAUTHORIZED })

  const { id: subscriptionId } = await params

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId, userId },
      include: { history: { orderBy: { endDate: "desc" }, take: 1 } }
    })

    if (!subscription) return NextResponse.json({ error: "Suscripción no encontrada." }, { status: NOT_FOUND })

    const lastHistory = subscription.history[0]
    if (!lastHistory) return NextResponse.json({ error: "No hay historial para renovar." }, { status: BAD_REQUEST })

    const startDate = new Date(lastHistory.endDate)
    const endDate = new Date(startDate)
    const originalDate = endDate.getDate()

    if (lastHistory.period === "month") endDate.setMonth(endDate.getMonth() + 1)
    if (lastHistory.period === "year") endDate.setFullYear(endDate.getFullYear() + 1)

    if (endDate.getDate() !== originalDate) endDate.setDate(0)

    const newHistory = await prisma.historySubscription.create({
      data: {
        subscriptionId,
        amount: lastHistory.amount,
        period: lastHistory.period,
        paymentMethodId: lastHistory.paymentMethodId,
        startDate,
        endDate,
        note: lastHistory.note
      }
    })

    return NextResponse.json(newHistory, { status: CREATED })
  } catch (_) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: INTERNAL_SERVER_ERROR })
  }
}
