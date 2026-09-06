import { NODE_ENV } from "@/lib/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import "dotenv/config"

const globalForPrisma = global as unknown as { prisma: PrismaClient }
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })
if (NODE_ENV !== "production") globalForPrisma.prisma = prisma

export default prisma
