import { Server } from "socket.io"
import { setupWs } from "../startup"

const startWs = (wsPort: number, appPort: number) => {
  console.log('TODO: Make origin environment variable.')
  const wsServer = new Server(wsPort, {cors: {origin: `http://localhost:${appPort}`}})
  setupWs(wsServer)

  return wsServer
}
export default startWs
