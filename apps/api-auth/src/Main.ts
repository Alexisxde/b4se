import { App } from "./App"

export class Main {
  static async main() {
    const app = new App()
    app.setupRoutes()
    app.start()
  }
}
