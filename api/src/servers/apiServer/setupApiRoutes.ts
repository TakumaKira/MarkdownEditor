import cors from 'cors'
import express, { Express } from 'express'
import { API_PATHS } from '../../constants'
import { FRONTEND_PORT, FRONTEND_PROTOCOL } from '../../getEnvs'
import error from '../../middlewares/error'
import authApiRouter from '../../routes/auth'
import documentsRouter from '../../routes/documents'
import rootRouter from '../../routes/root'

const setupApiRoutes = (expressApp: Express, frontendDomain: string) => {
  expressApp.use(cors({origin: `${FRONTEND_PROTOCOL}://${frontendDomain}${FRONTEND_PORT ? ':' + FRONTEND_PORT : ''}`}))
  expressApp.use(express.json())
  expressApp.use(API_PATHS.ROOT.path, rootRouter)
  expressApp.use(API_PATHS.AUTH.path, authApiRouter)
  expressApp.use(API_PATHS.DOCUMENTS.path, documentsRouter)
  expressApp.use(error)
}
export default setupApiRoutes
