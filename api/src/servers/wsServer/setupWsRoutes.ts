import { Server } from 'socket.io'
import { getWsAuthMiddleware } from '../../middlewares/auth'

const setupWsRoutes = (wsServer: Server) => {
  wsServer.use(getWsAuthMiddleware())
}
export default setupWsRoutes
