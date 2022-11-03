import { Server } from "socket.io"
import { setupWs } from "../startup"

const startWs = (wsPort: number, frontendDomain: string, frontendPort: number) => {
  const wsServer = new Server(wsPort, {cors: {origin: `http://${frontendDomain}:${frontendPort}`}})
  setupWs(wsServer)

  console.log(`⚡️[server]: Websocket server is running at localhost:${wsPort}`)
  return wsServer
}
export default startWs
