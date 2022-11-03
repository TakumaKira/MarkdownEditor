import { Express } from 'express'
import { Server } from "socket.io"
import { apiRoutes, wsRoutes } from './routes'

const setupApi = (express: Express, frontendDomain: string) => {
  apiRoutes(express, frontendDomain)
}
const setupWs = (wsServer: Server) => {
  wsRoutes(wsServer)
}
export { setupApi, setupWs }
