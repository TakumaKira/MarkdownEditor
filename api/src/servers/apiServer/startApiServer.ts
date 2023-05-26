import { Server } from "socket.io"
import getApiApp from "./apiApp"

const startApiServer = (apiPort: number, wsServer: Server) => {
  const { apiApp, isReady } = getApiApp(wsServer)
  const apiServer = apiApp.listen(apiPort, () => {
    console.log(`⚡️[server]: API server is running at localhost:${apiPort}`)
  })
  return { apiServer, isReady }
}
export default startApiServer
