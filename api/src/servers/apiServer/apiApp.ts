import express from "express"
import { FRONTEND_DOMAIN } from "../../getEnvs"
import setupApiApp from "./setupApiApp"

export default async () => {
  const apiApp = express()
  await setupApiApp(apiApp, FRONTEND_DOMAIN)
  return apiApp
}
