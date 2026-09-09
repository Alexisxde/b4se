import { userCreateSchema } from "@/features/auth/schemas/register"
import { signIn } from "@/lib/auth"
import db from "@/lib/prisma"
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, OK } from "@/utils/http-code"
import bcrypt from "bcrypt"
import { NextResponse } from "next/server"
import z from "zod"

const SALT_ROUNDS = 10

export async function POST(request: Request) {
  const body = await request.json()
  const { success, error, data } = userCreateSchema.safeParse(body)
  if (!success) return NextResponse.json({ error: z.flattenError(error) }, { status: BAD_REQUEST })

  try {
    const { name, email, password } = data
    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser)
      return NextResponse.json({ error: "A user with this email already exists" }, { status: BAD_REQUEST })
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
    const user = await db.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true, role: true }
    })
    await signIn("credentials", { email, password, redirect: false })
    return NextResponse.json({ user }, { status: OK })
  } catch (_) {
    return NextResponse.json({ error: "An error occurred while creating the user" }, { status: INTERNAL_SERVER_ERROR })
  }
}
