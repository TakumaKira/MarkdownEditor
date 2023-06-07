import express from "express"
import { Server } from "socket.io"
import setupApiApp from "./setupApiApp"
import { DatabaseClient } from "../../services/database/types"
import { SessionStorageClient } from "../../services/sessionStorage/type"

export default (wsServer: Server, dbClient: DatabaseClient, sessionStorageClient: SessionStorageClient, sessionStorageClientIsReady: Promise<void>) => {
  const apiApp = express()
  setupApiApp(apiApp, wsServer, dbClient, sessionStorageClient, sessionStorageClientIsReady)
  return apiApp
}
