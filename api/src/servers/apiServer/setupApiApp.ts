import { Express } from 'express'
import { Server } from 'socket.io'
import setupApiRoutes from './setupApiRoutes'

const setupApiApp = (apiApp: Express, frontendDomain: string, wsServer: Server) => {
  const isReady = setupApiRoutes(apiApp, frontendDomain, wsServer)
  return isReady
}
export default setupApiApp
