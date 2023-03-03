import { Server } from 'socket.io'
import { wsAuthMiddleware } from '../../middlewares/auth'

const setupWsRoutes = (wsServer: Server) => {
  wsServer.use(wsAuthMiddleware)
}
export default setupWsRoutes
