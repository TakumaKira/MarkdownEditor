import session from 'express-session'
import { JWT_SECRET_KEY } from '../../getEnvs'
import getSessionStore from './sessionStore'

const ONE_WEEK_IN_MILLISECONDS = 7 * 24 * 60 * 60 * 1000
export default () => session({
  secret: JWT_SECRET_KEY,
  store: getSessionStore(),
  saveUninitialized: false,
  resave: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    sameSite: true,
    maxAge: ONE_WEEK_IN_MILLISECONDS,
  },
})
