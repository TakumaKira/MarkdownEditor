import { Server } from "socket.io"
import { FRONTEND_DOMAIN, FRONTEND_PROTOCOL, FRONTEND_PORT } from "../../getEnvs"
import setupWsServer from "./setupWsServer"
import onExit from '../../onExit';

let wsServer: Server

const startWsServer = (wsPort: number) => {
  if (wsServer) {
    console.trace('wsServer is already running')
    return wsServer
  }
  wsServer = new Server(wsPort, {cors: {origin: `${FRONTEND_PROTOCOL}://${FRONTEND_DOMAIN}${FRONTEND_PORT ? ':' + FRONTEND_PORT : ''}`}})
  setupWsServer(wsServer)
  onExit.add(() => {
    wsServer.close()
  })

  console.log(`⚡️[server]: Websocket server is running at localhost:${wsPort}`)
  return wsServer
}
export default startWsServer
