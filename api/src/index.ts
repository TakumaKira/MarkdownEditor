import { API_PORT, FRONTEND_PORT, FRONTEND_DOMAIN, WS_PORT } from './getEnvs'
import startApi from './server/api'
import startWs from './server/ws'

startApi(API_PORT, FRONTEND_DOMAIN, FRONTEND_PORT)
export const wsServer = startWs(WS_PORT, FRONTEND_DOMAIN, FRONTEND_PORT)
