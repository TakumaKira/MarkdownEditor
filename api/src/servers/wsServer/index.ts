import { WS_PORT } from "../../getEnvs";
import startWsServer from "./startWsServer";

const wsServer = startWsServer(WS_PORT)
export default wsServer
