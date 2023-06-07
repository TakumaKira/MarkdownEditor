import { Express } from 'express'
import { Server } from 'socket.io'
import setupApiRoutes from './setupApiRoutes'
import { DatabaseClient } from '../../services/database/types'
import { SessionStorageClient } from '../../services/sessionStorage/type'

const setupApiApp = (apiApp: Express, wsServer: Server, dbClient: DatabaseClient, sessionStorageClient: SessionStorageClient, sessionStorageClientIsReady: Promise<void>) => {
  setupApiRoutes(apiApp, wsServer, dbClient, sessionStorageClient, sessionStorageClientIsReady)
}
export default setupApiApp
