import { Express } from 'express'
import setupApiRoutes from './setupApiRoutes'

const setupApiApp = async (apiApp: Express, frontendDomain: string) => {
  await setupApiRoutes(apiApp, frontendDomain)
}
export default setupApiApp
