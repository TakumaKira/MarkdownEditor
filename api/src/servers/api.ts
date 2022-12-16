import express from "express"
import { FRONTEND_DOMAIN, WS_PORT } from "../getEnvs"
import { setupApi } from "../startup"
import startWs from "./ws"

const apiApp = express()
setupApi(apiApp, FRONTEND_DOMAIN)
export default apiApp

export const wsServer = startWs(WS_PORT)

export const startApi = (apiPort: number) => {
  return apiApp.listen(apiPort, () => {
    console.log(`⚡️[server]: API server is running at localhost:${apiPort}`)
  })
}
