import getApiServer from './servers/apiServer'
import getWsServer from './servers/wsServer'
import getDBClient from './services/database/client'
import getSessionStorageClient from './services/sessionStorage/client'
import OnExitManager from './onExit'

const { sessionStorageClient, closeSessionStorageClient, sessionStorageClientIsReady } = getSessionStorageClient()
const { wsServer, closeWsServer } = getWsServer(sessionStorageClient, sessionStorageClientIsReady)
const { dbClient, closeDBClient } = getDBClient()
const { apiServer, closeApiServer } = getApiServer(wsServer, dbClient, sessionStorageClient, sessionStorageClientIsReady)

const onExit = new OnExitManager()
onExit.add(async () => {
  await Promise.all([
    () => closeApiServer(),
    () => closeWsServer(),
    () => closeDBClient(),
    () => closeSessionStorageClient(),
  ])
})

process.on('SIGINT', handleExit)
process.on('SIGTERM', handleExit)
process.on('SIGQUIT', handleExit)
function handleExit(signal: string) {
  console.info(`\nReceived ${signal}`)
  onExit.execute()
  process.exit()
}
