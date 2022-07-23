import dotenv from 'dotenv'
import startApi from './server/api'
import startWs from './server/ws'

dotenv.config()

const apiPort = Number(process.env.API_PORT)
if (!apiPort) {
  throw new Error('API_PORT is not defined.')
}
startApi(apiPort)

const wsPort = Number(process.env.WS_PORT)
if (!wsPort) {
  throw new Error('WS_PORT is not defined.')
}
const appPort = Number(process.env.APP_PORT)
if (!appPort) {
  throw new Error('APP_PORT is not defined.')
}
export const wsServer = startWs(wsPort, appPort)
