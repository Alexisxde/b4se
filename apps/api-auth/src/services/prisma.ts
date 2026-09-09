import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import "dotenv/config"
import { DATABASE_URL, NODE_ENV } from "../utils/config"

const globalForPrisma = global as unknown as { prisma: PrismaClient }
const adapter = new PrismaPg({ connectionString: DATABASE_URL })
const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })
if (NODE_ENV !== "production") globalForPrisma.prisma = prisma

export default prisma
