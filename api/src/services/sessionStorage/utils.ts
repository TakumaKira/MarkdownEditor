import { Server } from 'socket.io';
import uid from 'uid-safe'
import { REDIS_KEYS } from "../../constants";
import type SessionStorageController from "./controller";

export function getRedisKeyName(...args: string[]): string {
  return `${REDIS_KEYS.APP}:${args.join(':')}`
}

/**
 * Call this before replying EVERY request to prevent Session Fixation Attack.
 * What the heck is it? @see https://www.geeksforgeeks.org/session-fixation-attack/
 */
export function regenerateSession(req: Express.Request, sessionStorage: SessionStorageController, webSocketServer: Server, newUserData?: { id?: string, email?: string }): Promise<void> {
  return new Promise((resolve, reject) => {
    const { id: newUserId, email: newUserEmail } = newUserData || {}
    const { userId: oldUserId, userEmail: oldUserEmail, wsHandshakeToken: oldWsHandshakeToken } = req.session
    if (oldWsHandshakeToken) {
      sessionStorage.removeWsHandshakeToken(oldWsHandshakeToken)
    }
    req.session.regenerate(err => {
      if (err) return reject(err)
      const { id: newSessionId } = req.session
      req.session.userId = newUserId || oldUserId
      req.session.userEmail = newUserEmail || oldUserEmail
      const newWsHandshakeToken = uid.sync(24)
      // wsHandshakeToken should also be regenerated here.
      req.session.wsHandshakeToken = newWsHandshakeToken
      sessionStorage.saveWsHandshakeToken(newSessionId, newWsHandshakeToken)
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

export function destroySession(req: Express.Request, sessionStorage: SessionStorageController): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const { wsHandshakeToken: oldWsHandshakeToken } = req.session
    if (oldWsHandshakeToken) {
      sessionStorage.removeWsHandshakeToken(oldWsHandshakeToken)
    }
    req.session.destroy(err => {
      if (err) return reject(err)
      resolve()
    })
  })
}
