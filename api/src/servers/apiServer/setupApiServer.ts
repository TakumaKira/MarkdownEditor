import { Express } from 'express'
import setupApiRoutes from './setupApiRoutes'

const setupApiServer = (express: Express, frontendDomain: string) => {
  setupApiRoutes(express, frontendDomain)
}
export default setupApiServer
