import bcrypt from "bcrypt"
import prisma from "../services/prisma"
import { CONFLICT, NOT_FOUND } from "../utils/http-status-code"
import type { User } from "./AuthInterface"
import type { RegisterUser } from "./AuthSchema"

export class AuthService {
  public async create({ name, email, password }: RegisterUser) {
    const hashedPassword = (await bcrypt.hash(password, 10)) as string
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, password: true, role: true }
    })
    if (user) throw { status: CONFLICT, error: "El usuario ya existe. Intentelo de nuevo con otro email." }

    const userCreated = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true, role: true }
    })

    return userCreated
  }

  public async validate({ email, password }: Pick<User, "email" | "password">) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, password: true, role: true }
    })

    if (!user) throw { status: NOT_FOUND, error: "Usuario no encontrado. Por favor intentelo de nuevo." }
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) throw { status: NOT_FOUND, error: "Las credenciales proporcionadas no son válidas." }
    if (!user) throw { status: NOT_FOUND, error: "Usuario no encontrado." }
    return { id: user.id, role: user.role }
  }

  public async getById({ userId }: { userId: string }) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: { select: { id: true, url: true } }
      }
    })

    if (!user) throw { status: NOT_FOUND, error: "Usuario no encontrado." }
    return user
  }
}
