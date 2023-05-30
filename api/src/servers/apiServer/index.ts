import { Server } from "socket.io"
import startApiServer from "./startApiServer";
import { DatabaseClient } from "../../services/database/types";
import { SessionStorageClient } from "../../services/sessionStorage/type";

export default (wsServer: Server, dbClient: DatabaseClient, sessionStorageClient: SessionStorageClient, sessionStorageClientIsReady: Promise<void>) => {
  const { apiServer, closeApiServer } = startApiServer(wsServer, dbClient, sessionStorageClient, sessionStorageClientIsReady)
  return { apiServer, closeApiServer }
}
