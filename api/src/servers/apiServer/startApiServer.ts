import { Server } from "socket.io"
import getApiApp from "./apiApp"
import { DatabaseClient } from "../../services/database/types"
import { SessionStorageClient } from "../../services/sessionStorage/type"
import { API_PORT } from "../../getEnvs"

const startApiServer = (wsServer: Server, dbClient: DatabaseClient, sessionStorageClient: SessionStorageClient, sessionStorageClientIsReady: Promise<void>) => {
  const apiApp = getApiApp(wsServer, dbClient, sessionStorageClient, sessionStorageClientIsReady)
  const apiServer = apiApp.listen(API_PORT, () => {
    console.log(`⚡️[server]: API server is running at localhost:${API_PORT}`)
  })
  const closeApiServer = () => new Promise<void>((resolve, reject) =>
    apiServer.close(err => {
      if (err) {
        console.error('Failed to close API server.')
        console.error(err)
        reject()
        return
      }
      console.info('API server closed.')
      resolve()
    })
  )
  return { apiServer, closeApiServer }
}
export default startApiServer
