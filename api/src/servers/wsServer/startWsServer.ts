import { Server } from "socket.io"
import { FRONTEND_DOMAIN, FRONTEND_PROTOCOL, FRONTEND_PORT, WS_PORT } from "../../getEnvs"
import setupWsServer from "./setupWsServer"
import { SessionStorageClient } from "../../services/sessionStorage/type"

const startWsServer = (sessionStorageClient: SessionStorageClient, sessionStorageClientIsReady: Promise<void>) => {
  const wsServer = new Server(WS_PORT, {
    cors: {
      origin: `${FRONTEND_PROTOCOL}://${FRONTEND_DOMAIN}${FRONTEND_PORT ? ':' + FRONTEND_PORT : ''}`,
      credentials: true,
    },
    cookie: true,
  })
  console.info(`⚡️[server]: Websocket server is running at localhost:${WS_PORT}`)

  setupWsServer(wsServer, sessionStorageClient, sessionStorageClientIsReady)

  const closeWsServer = async () => {
    await new Promise<void>((resolve, reject) =>
      wsServer.close(err => {
        if (err) {
          console.error('Failed to close WebSocket server.')
          console.error(err)
          reject()
          return
        }
        console.info('WebSocket closed.')
        resolve()
      })
    )
  }
  return { wsServer, closeWsServer }
}
export default startWsServer
