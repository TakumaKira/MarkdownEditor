import { Server } from "socket.io"
import { FRONTEND_DOMAIN, FRONTEND_PROTOCOL } from "../getEnvs"
import { setupWs } from "../startup"

export const startWs = (wsPort: number) => {
  const wsServer = new Server(wsPort, {cors: {origin: `${FRONTEND_PROTOCOL}://${FRONTEND_DOMAIN}`}})
  setupWs(wsServer)

  console.log(`⚡️[server]: Websocket server is running at localhost:${wsPort}`)
  return wsServer
}
export default startWs
