import { subscriptionSchema } from "@/features/subscription/schemas/subscription"
import prisma from "@/lib/prisma"
import { BAD_REQUEST, CREATED, INTERNAL_SERVER_ERROR, UNAUTHORIZED } from "@/utils/http-code"
import { getServerAuthSession } from "@b4se/auth"
import { type NextRequest, NextResponse } from "next/server"
import z from "zod"

export async function postSubscription(request: NextRequest) {
  const session = await getServerAuthSession()
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: UNAUTHORIZED })
  if (!session.user) return NextResponse.json({ error: "No autorizado." }, { status: UNAUTHORIZED })
  const userId = session.user.id

  const body = await request.json()
  const { success, error, data } = subscriptionSchema.safeParse(body)
  if (!success) return NextResponse.json({ error: z.flattenError(error) }, { status: BAD_REQUEST })

  const { period, amount, note, startDate, serviceId, categoryId, paymentMethodId } = data

  try {
    const existingHistory = await prisma.historySubscription.findFirst({
      where: {
        startDate: new Date(startDate),
        subscription: {
          userId,
          serviceId
        }
      }
    })

    if (existingHistory)
      return NextResponse.json(
        { error: "Ya existe una suscripción para este servicio en este día." },
        { status: BAD_REQUEST }
      )

    const endDate = new Date(startDate)
    const originalDate = endDate.getDate()
    if (period === "month") endDate.setMonth(endDate.getMonth() + 1)
    if (period === "year") endDate.setFullYear(endDate.getFullYear() + 1)
    if (endDate.getDate() !== originalDate) endDate.setDate(0)

    const existingSubscription = await prisma.subscription.findFirst({
      where: { userId, serviceId }
    })

    if (existingSubscription) {
      const history = await prisma.historySubscription.create({
        data: {
          subscriptionId: existingSubscription.id,
          amount,
          startDate: new Date(startDate),
          endDate,
          paymentMethodId,
          period,
          note
        }
      })
      return NextResponse.json({ id: existingSubscription.id, history: [{ id: history.id }] }, { status: CREATED })
    }

    const subscription = await prisma.subscription.create({
      data: {
        serviceId,
        categoryId,
        userId,
        history: { create: { amount, startDate: new Date(startDate), endDate, paymentMethodId, period, note } }
      },
      select: { id: true, history: { select: { id: true } } }
    })
    return NextResponse.json(subscription, { status: CREATED })
  } catch (_) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: INTERNAL_SERVER_ERROR })
  }
}
