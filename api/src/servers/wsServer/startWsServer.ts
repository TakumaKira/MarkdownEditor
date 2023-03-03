import { Server } from "socket.io"
import { FRONTEND_DOMAIN, FRONTEND_PROTOCOL, FRONTEND_PORT } from "../../getEnvs"
import setupWsServer from "./setupWsServer"

const startWsServer = (wsPort: number) => {
  const wsServer = new Server(wsPort, {cors: {origin: `${FRONTEND_PROTOCOL}://${FRONTEND_DOMAIN}${FRONTEND_PORT ? ':' + FRONTEND_PORT : ''}`}})
  setupWsServer(wsServer)

  console.log(`⚡️[server]: Websocket server is running at localhost:${wsPort}`)
  return wsServer
}
export default startWsServer
