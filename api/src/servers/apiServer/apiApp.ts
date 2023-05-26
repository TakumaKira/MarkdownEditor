import express from "express"
import { Server } from "socket.io"
import { FRONTEND_DOMAIN } from "../../getEnvs"
import setupApiApp from "./setupApiApp"
import onExit from "../../onExit"

export default (wsServer: Server) => {
  const apiApp = express()
  const isReady = setupApiApp(apiApp, FRONTEND_DOMAIN, wsServer)
  return { apiApp, isReady, destroy: onExit.execute }
}
