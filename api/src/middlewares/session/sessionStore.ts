import RedisStore from 'connect-redis'
import { getRedisKeyName } from '../../services/sessionStorage/utils'
import { REDIS_KEYS } from '../../constants'
import getClient from '../../services/sessionStorage/getClient'

export default () => new RedisStore({
  client: getClient(),
  prefix: getRedisKeyName(`${REDIS_KEYS.SESSION}:`),
})
