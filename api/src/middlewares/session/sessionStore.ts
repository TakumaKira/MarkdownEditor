import RedisStore from 'connect-redis'
import { getRedisKeyName } from '../../services/sessionStorage/utils'
import { REDIS_KEYS } from '../../constants'
import { SessionStorageClient } from '../../services/sessionStorage/type'

export default (sessionStorageClient: SessionStorageClient) => {
  return new RedisStore({
    client: sessionStorageClient,
    prefix: getRedisKeyName(`${REDIS_KEYS.SESSION}:`),
  })
}
