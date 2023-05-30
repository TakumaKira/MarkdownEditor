import { createClient } from 'redis'
import { REDIS_HOST } from '../../getEnvs'

export default () => {
  const sessionStorageClient = createClient({
    url: `redis://${REDIS_HOST}`
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
