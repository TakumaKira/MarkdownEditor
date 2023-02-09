import { Express } from 'express'
import setupApiRoutes from './setupApiRoutes'

const setupApiApp = (apiApp: Express, frontendDomain: string) => {
  setupApiRoutes(apiApp, frontendDomain)
}
export default setupApiApp
