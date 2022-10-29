import cors from 'cors'
import express, { Express } from 'express'
import { Server } from 'socket.io'
import { API_PATHS } from '../constants'
import { authWsMiddleware } from '../middleware/auth'
import error from '../middleware/error'
import authApiRouter from '../routes/auth'
import documentsRouter from '../routes/documents'
import rootRouter from '../routes/root'

const apiRoutes = (expressApp: Express, origin: string, appPort: number) => {
  expressApp.use(cors({origin: `${origin}:${appPort}`}))
  expressApp.use(express.json())
  expressApp.use(API_PATHS.ROOT.path, rootRouter)
  expressApp.use(API_PATHS.AUTH.path, authApiRouter)
  expressApp.use(API_PATHS.DOCUMENTS.path, documentsRouter)
  expressApp.use(error)
}
const wsRoutes = (wsServer: Server) => {
  wsServer.use(authWsMiddleware)
}
export { apiRoutes, wsRoutes }
