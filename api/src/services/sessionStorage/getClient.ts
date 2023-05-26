import { createClient } from 'redis'
import onExit from '../../onExit'
import { REDIS_HOST } from '../../getEnvs'

const clients: ReturnType<typeof createClient>[] = []

export default (disableAutoCleanup?: boolean) => {
  const client = createClient({
    url: `redis://${REDIS_HOST}`
  })
  if (!disableAutoCleanup) {
    clients.push(client)
  }
  const isReady = client.connect()
    .then(() => {
      console.info('Redis client connected.')
    })
    .catch(e => {
      console.error(e)
      throw new Error('Could not connect to Redis server.')
    })
  return { client, isReady }
}

onExit.add(async () => {
  await Promise.all(clients.map(client =>
    client.quit()
      .then(() => console.info('Redis client closed.'))
      .catch(err => {
        console.error('Failed to close Redis client.')
        console.error(err)
      })
  ))
})
