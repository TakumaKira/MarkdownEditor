import { Server } from "socket.io"
import { WS_PORT } from "../../getEnvs";
import startWsServer from "./startWsServer";

let wsServer: Server

export default () => {
  if (!wsServer) {
    wsServer = startWsServer(WS_PORT)
  }
  return wsServer
}
