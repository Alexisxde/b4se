import type { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { AuthController } from "../auth/AuthController"
import type { UserJWT } from "../auth/AuthInterface"
import { JWT_SECRET } from "../utils/config"
import { UNAUTHORIZED } from "../utils/http-status-code"

export class SessionMiddleware {
  private authController: AuthController

  constructor() {
    this.authController = new AuthController()
  }

  verify = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) return res.status(UNAUTHORIZED).json({ success: false, error: "Unauthorized" })

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as UserJWT
      req.body.user = decoded
      return next()
    } catch (_) {
      this.authController.refresh(req, res, next)
    }
  }
}
