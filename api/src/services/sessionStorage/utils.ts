import { Server } from 'socket.io';
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
export function regenerateSession(req: Express.Request, sessionStorage: Controller, webSocketServer: Server, newUserData?: { id?: string, email?: string }): Promise<void> {
  return new Promise((resolve, reject) => {
    const { id: newUserId, email: newUserEmail } = newUserData || {}
    const { userId: oldUserId, userEmail: oldUserEmail, wsHandshakeToken: oldWsHandshakeToken } = req.session
    sessionStorage.removeWsHandshakeToken(req.session.id)
    req.session.regenerate(err => {
      if (err) return reject(err)
      req.session.userId = newUserId || oldUserId
      req.session.userEmail = newUserEmail || oldUserEmail
      const newWsHandshakeToken = uid.sync(24)
      // wsHandshakeToken should also be regenerated here.
      req.session.wsHandshakeToken = newWsHandshakeToken
      sessionStorage.saveWsHandshakeToken(req.session.id, newWsHandshakeToken)
      webSocketServer.fetchSockets()
        .then(sockets => {
          const socket = sockets.find(socket => socket.handshake.auth.wsHandshakeToken === oldWsHandshakeToken)
          if (socket) {
            socket.handshake.auth.wsHandshakeToken = newWsHandshakeToken
          }
        })
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
