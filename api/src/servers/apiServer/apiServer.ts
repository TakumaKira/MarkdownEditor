import express from "express"
import { FRONTEND_DOMAIN } from "../../getEnvs"
import setupApiServer from "./setupApiServer"

const apiServer = express()
setupApiServer(apiServer, FRONTEND_DOMAIN)
export default apiServer
