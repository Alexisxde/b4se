import { AuthRoute, type Route } from "./auth/AuthRoute"
import { Server } from "./Server"
import { PORT } from "./utils/config"

export class App {
  private server: Server

  constructor() {
    this.server = new Server()
  }

  public setupRoutes() {
    const routes: Route[] = [new AuthRoute()]
    for (const route of routes) {
      this.server.use(route.getPath, route.getRouter)
    }
  }

  public start() {
    this.server.listen(+PORT, () => {
      // biome-ignore lint/suspicious/noConsole: .
      console.log(`API Auth Service is running on port ${PORT}`)
    })
  }
}
