import { Express } from 'express'
import { Server } from "socket.io"
import { apiRoutes, wsRoutes } from './routes'

const setupApi = (express: Express, origin: string, appPort: number) => {
  apiRoutes(express, origin, appPort)
}
const setupWs = (wsServer: Server) => {
  wsRoutes(wsServer)
}
export { setupApi, setupWs }
