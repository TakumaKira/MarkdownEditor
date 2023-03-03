import { Server } from "socket.io"
import setupWsRoutes from "./setupWsRoutes"

const setupWsServer = (wsServer: Server) => {
  setupWsRoutes(wsServer)
}
export default setupWsServer
