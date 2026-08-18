import type { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { JWT_SECRET, JWT_SECRET_REFRESHTOKEN, NODE_ENV } from "../utils/config"
import { CREATED, OK, UNAUTHORIZED } from "../utils/http-status-code"
import type { UserJWT } from "./AuthInterface"
import type { LoginUser, RegisterUser } from "./AuthSchema"
import { AuthService } from "./AuthService"

export class AuthController {
  private authService: AuthService

  constructor() {
    this.authService = new AuthService()
  }

  async register(req: Request, res: Response, next: NextFunction) {
    const { name, email, password } = req.body as RegisterUser
    try {
      const data = await this.authService.create({ name, email, password })
      res.status(CREATED).json({ success: true, data, error: null })
    } catch (err) {
      next(err)
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body as LoginUser

    try {
      const { id, role } = await this.authService.validate({ email, password })
      const token = jwt.sign({ id, role }, JWT_SECRET, { expiresIn: "8h" })
      const refreshToken = jwt.sign({ id, role }, JWT_SECRET_REFRESHTOKEN, { expiresIn: "15d" })

      res.cookie("token", token, {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: "none",
        maxAge: 8 * 60 * 60 * 1000
      })
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: "none",
        maxAge: 15 * 24 * 60 * 60 * 1000
      })

      res.status(200).json({ success: true, data: { token, refreshToken }, error: null })
    } catch (err) {
      next(err)
    }
  }

  async logout(_req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie("token", { httpOnly: true, secure: NODE_ENV === "production", sameSite: "none" })
      res.clearCookie("refreshToken", { httpOnly: true, secure: NODE_ENV === "production", sameSite: "none" })
      res.status(200).json({ success: true, error: null })
    } catch (err) {
      next(err)
    }
  }

  async user(req: Request, res: Response, next: NextFunction) {
    const { id: userId } = req.body.user as UserJWT

    try {
      const data = await this.authService.getById({ userId })
      res.status(200).json({ success: true, data, error: null })
    } catch (err) {
      next(err)
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    const refreshToken = req.cookies.refreshToken

    try {
      if (!refreshToken) throw { status: UNAUTHORIZED, error: "No hay refresh token." }
      const { exp, iat, ...decoded } = jwt.verify(refreshToken, JWT_SECRET_REFRESHTOKEN) as UserJWT
      const newToken = jwt.sign(decoded, JWT_SECRET, { expiresIn: "8h" })

      res.cookie("token", newToken, {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: "none",
        maxAge: 8 * 60 * 60 * 1000
      })

      res.status(OK).json({ success: true, data: { token: newToken, refreshToken }, error: null })
    } catch (err) {
      next(err)
    }
  }
}
