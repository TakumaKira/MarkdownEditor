import RedisStore from 'connect-redis'
import { getRedisKeyName } from '../../services/sessionStorage/utils'
import { REDIS_KEYS } from '../../constants'
import getClient from '../../services/sessionStorage/getClient'

export default async () => {
  const { client, isConnecting } = getClient()
  await isConnecting
  return new RedisStore({
    client,
    prefix: getRedisKeyName(`${REDIS_KEYS.SESSION}:`),
  })
}
