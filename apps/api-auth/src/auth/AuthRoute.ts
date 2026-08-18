import { Router } from "express"
import { SchemaMiddleware } from "../middlewares/SchemaMiddleware"
import { SessionMiddleware } from "../middlewares/SessionMiddleware"
import { AuthController } from "./AuthController"
import AuthSchema from "./AuthSchema"

export interface Route {
  getRouter: Router
  getPath: string
}

export class AuthRoute implements Route {
  private path: string
  private router: Router
  private authSchema = AuthSchema
  private authController: AuthController
  private schemaMiddleware: SchemaMiddleware
  private sessionMiddleware: SessionMiddleware

  constructor() {
    this.router = Router()
    this.authController = new AuthController()
    this.path = "/auth"
    this.schemaMiddleware = new SchemaMiddleware()
    this.sessionMiddleware = new SessionMiddleware()
    this.initRoutes()
  }

  private initRoutes() {
    this.router.get("/me", this.sessionMiddleware.verify, this.authController.user.bind(this.authController))
    this.router.post(
      "/register",
      this.schemaMiddleware.body(this.authSchema.register),
      this.authController.register.bind(this.authController)
    )
    this.router.post(
      "/login",
      this.schemaMiddleware.body(this.authSchema.login),
      this.authController.login.bind(this.authController)
    )
    this.router.post("/logout", this.sessionMiddleware.verify, this.authController.logout.bind(this.authController))
    this.router.post("/refresh", this.sessionMiddleware.verify, this.authController.refresh.bind(this.authController))
  }

  get getRouter() {
    return this.router
  }

  get getPath() {
    return this.path
  }
}
