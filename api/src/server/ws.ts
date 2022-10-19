import { Server } from "socket.io"
import { setupWs } from "../startup"

const startWs = (origin: string, wsPort: number, appPort: number) => {
  const wsServer = new Server(wsPort, {cors: {origin: `${origin}:${appPort}`}})
  setupWs(wsServer)

  console.log(`⚡️[server]: Websocket server is running at ${origin}:${wsPort}`)
  return wsServer
}
export default startWs
