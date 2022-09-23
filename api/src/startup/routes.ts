import cors from 'cors'
import express, { Express } from 'express'
import { Server } from 'socket.io'
import { API_PATHS } from '../constants'
import { authWsMiddleware } from '../middleware/auth'
import error from '../middleware/error'
import authApiRouter from '../routes/auth'
import documentsRouter from '../routes/documents'

const apiRoutes = (expressApp: Express) => {
  console.log('TODO: Switch origin with environment variables.')
  expressApp.use(cors({origin: 'http://localhost:19006'}))
  expressApp.use(express.json())
  expressApp.use(API_PATHS.AUTH.path, authApiRouter)
  expressApp.use(API_PATHS.DOCUMENTS.path, documentsRouter)
  expressApp.use(error)
}
const wsRoutes = (wsServer: Server) => {
  wsServer.use(authWsMiddleware)
}
export { apiRoutes, wsRoutes }
