import cors from 'cors'
import express, { Express } from 'express'
import { API_PATHS, DOCUMENT_RESPONSE_HEADER_USER_EMAIL_KEY, HEADER_WS_HANDSHAKE_TOKEN_KEY } from '../../constants'
import { FRONTEND_DOMAIN, FRONTEND_PORT, FRONTEND_PROTOCOL } from '../../getEnvs'
import errorMiddleware from '../../middlewares/error'
import getAuthApiRouter from '../../routes/auth'
import getDocumentsRouter from '../../routes/documents'
import rootRouter from '../../routes/root'
import getSessionMiddleware from '../../middlewares/session'
import { Server } from 'socket.io'
import { DatabaseClient } from '../../services/database/types'
import { SessionStorageClient } from '../../services/sessionStorage/type'

const setupApiRoutes = (apiApp: Express, wsServer: Server, dbClient: DatabaseClient, sessionStorageClient: SessionStorageClient, sessionStorageClientIsReady: Promise<void>) => {
  apiApp.use(cors({
    origin: `${FRONTEND_PROTOCOL}://${FRONTEND_DOMAIN}${FRONTEND_PORT ? ':' + FRONTEND_PORT : ''}`,
    credentials: true,
    exposedHeaders: [HEADER_WS_HANDSHAKE_TOKEN_KEY, DOCUMENT_RESPONSE_HEADER_USER_EMAIL_KEY],
  }))
  apiApp.use(express.json())
  const sessionMiddleware = getSessionMiddleware(sessionStorageClient)
  apiApp.use(sessionMiddleware)
  apiApp.use(API_PATHS.ROOT.path, rootRouter)
  apiApp.use(API_PATHS.AUTH.path, getAuthApiRouter(wsServer, dbClient, sessionStorageClient, sessionStorageClientIsReady))
  apiApp.use(API_PATHS.DOCUMENTS.path, getDocumentsRouter(wsServer, dbClient, sessionStorageClient, sessionStorageClientIsReady))
  apiApp.use(errorMiddleware)
}
export default setupApiRoutes
