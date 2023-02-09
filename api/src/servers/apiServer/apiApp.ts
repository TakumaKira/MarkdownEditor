import express from "express"
import { FRONTEND_DOMAIN } from "../../getEnvs"
import setupApiApp from "./setupApiApp"

const apiApp = express()
setupApiApp(apiApp, FRONTEND_DOMAIN)
export default apiApp
