import uid from 'uid-safe'
import { REDIS_KEYS } from "../../constants";
import Controller from "./controller";

export function getRedisKeyName(...args: string[]): string {
  return `${REDIS_KEYS.APP}:${args.join(':')}`
}

/**
 * Call this before replying EVERY request to prevent Session Fixation Attack.
 * What the heck is it? @see https://www.geeksforgeeks.org/session-fixation-attack/
 */
export function regenerateSession(req: Express.Request, sessionStorage: Controller): Promise<void> {
  return new Promise((resolve, reject) => {
    sessionStorage.removeWsHandshakeToken(req.session.id)
    const { userId, userEmail } = req.session
    req.session.regenerate(err => {
      if (err) return reject(err)
      req.session.userId = userId
      req.session.userEmail = userEmail
      // wsHandshakeToken should also be regenerated here.
      req.session.wsHandshakeToken = uid.sync(24)
      sessionStorage.saveWsHandshakeToken(req.session.id, req.session.wsHandshakeToken)
      resolve()
    })
  })
}

export function destroySession(req: Express.Request, sessionStorage: Controller): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    sessionStorage.removeWsHandshakeToken(req.session.id)
    req.session.destroy(err => {
      if (err) return reject(err)
      resolve()
    })
  })
}
