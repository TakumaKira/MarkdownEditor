import express from "express"
import { FRONTEND_DOMAIN } from "../../getEnvs"
import setupApiApp from "./setupApiApp"

export default () => {
  const apiApp = express()
  setupApiApp(apiApp, FRONTEND_DOMAIN)
  return apiApp
}
