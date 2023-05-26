import RedisStore from 'connect-redis'
import { getRedisKeyName } from '../../services/sessionStorage/utils'
import { REDIS_KEYS } from '../../constants'
import getClient from '../../services/sessionStorage/getClient'

export default () => {
  const { client, isReady } = getClient()
  return {
    sessionStore: new RedisStore({
      client,
      prefix: getRedisKeyName(`${REDIS_KEYS.SESSION}:`),
    }),
    isReady
  }
}
