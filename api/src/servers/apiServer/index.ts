import { Server } from "http"
import { API_PORT } from "../../getEnvs";
import startApiServer from "./startApiServer";

let apiServer: Server

export default async () => {
  if (!apiServer) {
    apiServer = await startApiServer(API_PORT)
  }
  return apiServer
}
