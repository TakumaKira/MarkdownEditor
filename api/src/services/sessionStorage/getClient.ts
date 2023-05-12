import { createClient } from 'redis'
import onExit from '../../onExit'

const client = createClient()

const getClient = () => {
  if (!client.isOpen) {
    client.connect()
      .then(() => {
        console.info('Redis client connected.')
      })
      .catch(e => {
        console.error(e)
        throw new Error('Could not connect to Redis server.')
      })
  }
  return client
}
export default getClient

onExit.add(() => {
  if (client.isOpen) {
    client.quit()
    console.info('Redis client closed.')
  }
})
