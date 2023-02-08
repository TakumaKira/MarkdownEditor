import { Server } from "socket.io"
import { FRONTEND_DOMAIN, FRONTEND_PROTOCOL } from "../../getEnvs"
import setupWsServer from "./setupWsServer"

const startWsServer = (wsPort: number) => {
  const wsServer = new Server(wsPort, {cors: {origin: `${FRONTEND_PROTOCOL}://${FRONTEND_DOMAIN}`}})
  setupWsServer(wsServer)

  console.log(`⚡️[server]: Websocket server is running at localhost:${wsPort}`)
  return wsServer
}
export default startWsServer
