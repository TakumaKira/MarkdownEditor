import { API_PORT, APP_PORT, ORIGIN, WS_PORT } from './getEnvs'
import startApi from './server/api'
import startWs from './server/ws'

startApi(ORIGIN, API_PORT, APP_PORT)
export const wsServer = startWs(ORIGIN, WS_PORT, APP_PORT)
