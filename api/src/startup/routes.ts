import express, { Express } from 'express'
import { Server } from 'socket.io'
import { authWs } from '../middleware/auth'
import error from '../middleware/error'
import authApiRouter from '../routes/auth'
import documentsRouter from '../routes/documents'

const apiRoutes = (expressApp: Express) => {
  expressApp.use(express.json())
  expressApp.use('/api/auth', authApiRouter)
  expressApp.use('/api/documents', documentsRouter)
  expressApp.use(error)
}
const wsRoutes = (wsServer: Server) => {
  wsServer.use(authWs)
}
export { apiRoutes, wsRoutes }
