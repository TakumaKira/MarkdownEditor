import { Server } from "http"
import getApiApp from "./apiApp"

const startApiServer = (apiPort: number): Server => {
  return getApiApp().listen(apiPort, () => {
    console.log(`⚡️[server]: API server is running at localhost:${apiPort}`)
  })
}
export default startApiServer
