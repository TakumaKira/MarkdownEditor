import { Server } from "http"
import { Server as WSServer } from "socket.io"
import { API_PORT } from "../../getEnvs";
import startApiServer from "./startApiServer";

let apiServer: Server
let isReady: Promise<void>

export default (wsServer: WSServer) => {
  if (!apiServer) {
    const { apiServer: _apiServer, isReady: _isReady } = startApiServer(API_PORT, wsServer)
    apiServer = _apiServer
    isReady = _isReady
  }
  return { apiServer, isReady }
}
