import RedisStore from 'connect-redis'
import { getRedisKeyName } from './utils'
import { REDIS_KEYS } from '../../constants'
import getClient from './getClient'
import { SessionData } from 'express-session'

const sessionStore = new RedisStore({
  client: getClient(),
  prefix: getRedisKeyName(`${REDIS_KEYS.SESSION}:`),
})

export default sessionStore
