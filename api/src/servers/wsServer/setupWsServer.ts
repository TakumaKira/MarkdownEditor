import { Server } from "socket.io"
import setupWsRoutes from "./setupWsRoutes"
import { SessionStorageClient } from "../../services/sessionStorage/type"

const setupWsServer = (wsServer: Server, sessionStorageClient: SessionStorageClient, sessionStorageClientIsReady: Promise<void>) => {
  setupWsRoutes(wsServer, sessionStorageClient, sessionStorageClientIsReady)
}
export default setupWsServer
