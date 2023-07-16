import { createClient } from 'redis'
import { REDIS_HOST, REDIS_PORT, REDIS_USER, REDIS_PASSWORD } from '../../getEnvs'

export default () => {
  const sessionStorageClient = createClient({
    url: `redis://${REDIS_USER}${REDIS_PASSWORD ? ':' + REDIS_PASSWORD : ''}@${REDIS_HOST}:${REDIS_PORT}`,
    pingInterval: 10000,
  })
  const sessionStorageClientIsReady = sessionStorageClient.connect()
    .then(() => {
      console.info('Redis client connected.')
    })
    .catch(e => {
      console.error(e)
      throw new Error('Could not connect to Redis server.')
    })
  const closeSessionStorageClient = async () => {
    sessionStorageClient.quit()
      .then(() => console.info('Redis client closed.'))
      .catch(err => {
        console.error('Failed to close Redis client.')
        console.error(err)
      })
  }
  return { sessionStorageClient, closeSessionStorageClient, sessionStorageClientIsReady }
}
