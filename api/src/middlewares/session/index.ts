import session from 'express-session'
import { JWT_SECRET_KEY } from '../../getEnvs'
import getSessionStore from './sessionStore'
import { SESSION_MAX_AGE } from '../../constants'

export default () => {
  const { sessionStore, isReady } = getSessionStore()
  return {
    sessionMiddleware: session({
      secret: JWT_SECRET_KEY,
      store: sessionStore,
      saveUninitialized: false,
      resave: false,
      rolling: true,
      cookie: {
        httpOnly: true,
        sameSite: true,
        maxAge: SESSION_MAX_AGE,
      },
    }),
    isReady
  }
}
