import { API_PORT } from './getEnvs'
import startApiServer from './servers/apiServer/startApiServer'
import wsServer from './servers/wsServer/wsServer'

startApiServer(API_PORT)
export { wsServer }
