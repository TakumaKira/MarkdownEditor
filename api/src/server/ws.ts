import { Server } from "socket.io"
import { setupWs } from "../startup"

const startWs = (wsPort: number, appPort: number) => {
  const wsServer = new Server(wsPort, {cors: {origin: `http://localhost:${appPort}`}})
  setupWs(wsServer)

  return wsServer
}
export default startWs
