import dotenv from 'dotenv'
import startApi from './server/api'
import startWs from './server/ws'

dotenv.config()

const API_PORT = Number(process.env.API_PORT)
if (!API_PORT) {
  throw new Error('API_PORT is not defined.')
}
startApi(API_PORT)

const WS_PORT = Number(process.env.WS_PORT)
if (!WS_PORT) {
  throw new Error('WS_PORT is not defined.')
}
const appPort = Number(process.env.APP_PORT)
if (!appPort) {
  throw new Error('APP_PORT is not defined.')
}
export const wsServer = startWs(WS_PORT, appPort)
