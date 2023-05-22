import { createClient } from 'redis'
import onExit from '../../onExit'
import { REDIS_HOST } from '../../getEnvs'

const clients: ReturnType<typeof createClient>[] = []

export default () => {
  const client = createClient({
    url: `redis://${REDIS_HOST}`
  })
  clients.push(client)
  client.connect()
    .then(() => {
      console.info('Redis client connected.')
    })
    .catch(e => {
      console.error(e)
      throw new Error('Could not connect to Redis server.')
    })
  return client
}

onExit.add(() => {
  clients.forEach(client => {
    if (client.isOpen) {
      client.quit()
      console.info('Redis client closed.')
    }
  })
})
