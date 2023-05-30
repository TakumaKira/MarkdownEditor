import { Server } from 'socket.io'
import { getWsAuthMiddleware } from '../../middlewares/auth'
import { SessionStorageClient } from '../../services/sessionStorage/type'

const setupWsRoutes = (wsServer: Server, sessionStorageClient: SessionStorageClient, sessionStorageClientIsReady: Promise<void>) => {
  wsServer.use(getWsAuthMiddleware(sessionStorageClient, sessionStorageClientIsReady))
}
export default setupWsRoutes
