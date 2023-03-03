import { Server } from "http"
import apiApp from "./apiApp"

const startApiServer = (apiPort: number): Server => {
  return apiApp.listen(apiPort, () => {
    console.log(`⚡️[server]: API server is running at localhost:${apiPort}`)
  })
}
export default startApiServer
