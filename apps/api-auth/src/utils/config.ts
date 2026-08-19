import dotenv from "dotenv"
import { z } from "zod"

dotenv.config()

const envSchema = z.object({
  DATABASE_URL: z.string(),
  PORT: z.string().default("3001"),
  NODE_ENV: z.string().default("production"),
  JWT_SECRET_REFRESHTOKEN: z.string(),
  JWT_SECRET: z.string()
})

const { error, success, data } = envSchema.safeParse(process.env)

if (!success) {
  // biome-ignore lint/suspicious/noConsole: Permitido para verificar las variables en el servidor.
  console.error("❌ Error en las variables de entorno: ", error.format())
  process.exit(1)
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}

export const { PORT, DATABASE_URL, NODE_ENV, JWT_SECRET_REFRESHTOKEN, JWT_SECRET } = data
