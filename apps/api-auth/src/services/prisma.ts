import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import { DATABASE_URL } from "../utils/config"

const adapter = new PrismaPg({ connectionString: DATABASE_URL })
export default new PrismaClient({ adapter })
