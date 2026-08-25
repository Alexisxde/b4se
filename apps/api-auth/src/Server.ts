import cookieParser from "cookie-parser"
import cors from "cors"
import express, { json, type Application, type NextFunction, type Request, type Response, type Router } from "express"
import morgan from "morgan"
import type { HttpError } from "./types/error"
import { INTERNAL_SERVER_ERROR } from "./utils/http-status-code"

export class Server {
  private app: Application

  constructor() {
    this.app = express()
    this.init()
  }

  private init() {
    this.app.use(json())
    this.app.use(morgan("dev"))
    this.app.use(
      cors({
        origin: ["http://localhost:3000", "http://localhost:3001"],
        credentials: true,
        methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
      })
    )
    this.app.use(cookieParser())
  }

  public get(path: string, callback: (req: Request, res: Response) => void) {
    this.app.get(path, callback)
  }

  public async listen(port: number, callback: () => void) {
    this.app.use((err: HttpError, _req: Request, res: Response, _next: NextFunction) => {
      console.log(err)
      res
        .status(err.status || INTERNAL_SERVER_ERROR)
        .json({ success: false, error: err.error || "Internal Server Error" })
    })
    this.app.listen(port, callback)
  }

  public async use(path: string, router: Router) {
    this.app.use(path, router)
  }
}
