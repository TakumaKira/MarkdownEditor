import { Express } from 'express'
import { Server } from "socket.io"
import { apiRoutes, wsRoutes } from './routes'

const setupApi = (express: Express) => {
  apiRoutes(express)
}
const setupWs = (wsServer: Server) => {
  wsRoutes(wsServer)
}
export { setupApi, setupWs }
