import getApiServer from './servers/apiServer'
import getWsServer from './servers/wsServer'
import onExit from './onExit'

const wsServer = getWsServer()
const { apiServer, isReady } = getApiServer(wsServer)
onExit.add(async () => {
  await new Promise<void>((resolve, reject) => apiServer.close(err => {
    if (err) {
      console.error('Failed to close API server.')
      console.error(err)
      reject()
      return
    }
    console.info('API server closed.')
    resolve()
  }))
})

process.on('SIGINT', handleExit)
process.on('SIGTERM', handleExit)
process.on('SIGQUIT', handleExit)
function handleExit(signal: string) {
  console.info(`\nReceived ${signal}`)
  onExit.execute()
  process.exit()
}
