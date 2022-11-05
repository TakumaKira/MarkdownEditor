import { Server } from "socket.io"
import { FRONTEND_PROTOCOL } from "../getEnvs"
import { setupWs } from "../startup"

const startWs = (wsPort: number, frontendDomain: string) => {
  const wsServer = new Server(wsPort, {cors: {origin: `${FRONTEND_PROTOCOL}://${frontendDomain}`}})
  setupWs(wsServer)

  console.log(`⚡️[server]: Websocket server is running at localhost:${wsPort}`)
  return wsServer
}
export default startWs
