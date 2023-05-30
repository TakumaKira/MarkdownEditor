import { SessionStorageClient } from "../../services/sessionStorage/type";
import startWsServer from "./startWsServer";

export default (sessionStorageClient: SessionStorageClient, sessionStorageClientIsReady: Promise<void>) => {
  const { wsServer, closeWsServer } = startWsServer(sessionStorageClient, sessionStorageClientIsReady)
  return { wsServer, closeWsServer }
}
