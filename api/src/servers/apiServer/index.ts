import { API_PORT } from "../../getEnvs";
import startApiServer from "./startApiServer";

const apiServer = startApiServer(API_PORT)
export default apiServer
