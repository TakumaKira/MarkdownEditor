import { Server } from "socket.io"
import { FRONTEND_DOMAIN, FRONTEND_PROTOCOL, FRONTEND_PORT } from "../../getEnvs"
import setupWsServer from "./setupWsServer"
import onExit from '../../onExit';

let wsServer: Server

const startWsServer = (wsPort: number) => {
  if (wsServer) {
    console.error(new Error('wsServer is already running'))
    return wsServer
  }
  wsServer = new Server(wsPort, {cors: {origin: `${FRONTEND_PROTOCOL}://${FRONTEND_DOMAIN}${FRONTEND_PORT ? ':' + FRONTEND_PORT : ''}`}})
  setupWsServer(wsServer)
  onExit.add(async () => {
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
  })

  console.info(`⚡️[server]: Websocket server is running at localhost:${wsPort}`)
  return wsServer
}
export default startWsServer
