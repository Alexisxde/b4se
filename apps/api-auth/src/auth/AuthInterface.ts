import type { User as UserPrisma } from "@prisma/client"
import type { JwtPayload } from "jsonwebtoken"

export interface User extends UserPrisma {}

export const userRoleValues = ["admin", "user"] as const
export type UserRole = (typeof userRoleValues)[number]
export type UserJWT = Required<Pick<User, "id" | "role">> & JwtPayload
