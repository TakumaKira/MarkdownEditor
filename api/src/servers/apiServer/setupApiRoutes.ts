import cors from 'cors'
import express, { Express } from 'express'
import { API_PATHS } from '../../constants'
import { FRONTEND_PORT, FRONTEND_PROTOCOL } from '../../getEnvs'
import errorMiddleware from '../../middlewares/error'
import authApiRouter from '../../routes/auth'
import documentsRouter from '../../routes/documents'
import rootRouter from '../../routes/root'
import getSessionMiddleware from '../../middlewares/session'

const setupApiRoutes = (apiApp: Express, frontendDomain: string) => {
  apiApp.use(cors({origin: `${FRONTEND_PROTOCOL}://${frontendDomain}${FRONTEND_PORT ? ':' + FRONTEND_PORT : ''}`}))
  apiApp.use(express.json())
  apiApp.use(getSessionMiddleware())
  apiApp.use(API_PATHS.ROOT.path, rootRouter)
  apiApp.use(API_PATHS.AUTH.path, authApiRouter)
  apiApp.use(API_PATHS.DOCUMENTS.path, documentsRouter)
  apiApp.use(errorMiddleware)
}
export default setupApiRoutes
