import session from 'express-session'
import { sessionStore } from '../services/sessionStorage'
import { JWT_SECRET_KEY } from '../getEnvs'

const ONE_WEEK_IN_MILLISECONDS = 7 * 24 * 60 * 60 * 1000
export default session({
  secret: JWT_SECRET_KEY,
  store: sessionStore,
  saveUninitialized: false,
  resave: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    sameSite: true,
    maxAge: ONE_WEEK_IN_MILLISECONDS,
  },
})
