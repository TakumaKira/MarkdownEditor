import cors from 'cors'
import express, { Express } from 'express'
import { API_PATHS } from '../../constants'
import { FRONTEND_PORT, FRONTEND_PROTOCOL } from '../../getEnvs'
import errorMiddleware from '../../middlewares/error'
import getAuthApiRouter from '../../routes/auth'
import getDocumentsRouter from '../../routes/documents'
import rootRouter from '../../routes/root'
import getSessionMiddleware from '../../middlewares/session'
import { Server } from 'socket.io'
import { DatabaseClient } from '../../services/database/types'
import { SessionStorageClient } from '../../services/sessionStorage/type'
import getDatabaseController from '../../services/database'

const setupApiRoutes = (apiApp: Express, frontendDomain: string, wsServer: Server, dbClient: DatabaseClient, sessionStorageClient: SessionStorageClient, sessionStorageClientIsReady: Promise<void>) => {
  const dbController = getDatabaseController(dbClient)
  apiApp.use(cors({origin: `${FRONTEND_PROTOCOL}://${frontendDomain}${FRONTEND_PORT ? ':' + FRONTEND_PORT : ''}`}))
  apiApp.use(express.json())
  const sessionMiddleware = getSessionMiddleware(sessionStorageClient)
  apiApp.use(sessionMiddleware)
  apiApp.use(API_PATHS.ROOT.path, rootRouter)
  apiApp.use(API_PATHS.AUTH.path, getAuthApiRouter(wsServer, dbController, sessionStorageClient, sessionStorageClientIsReady))
  apiApp.use(API_PATHS.DOCUMENTS.path, getDocumentsRouter(wsServer, dbController, sessionStorageClient, sessionStorageClientIsReady))
  apiApp.use(errorMiddleware)
}
export default setupApiRoutes
