import uid from 'uid-safe'
import { REDIS_KEYS } from "../../constants";
import Controller from "./controller";
import { Server } from 'socket.io';

export function getRedisKeyName(...args: string[]): string {
  return `${REDIS_KEYS.APP}:${args.join(':')}`
}

/**
 * Call this before replying EVERY request to prevent Session Fixation Attack.
 * What the heck is it? @see https://www.geeksforgeeks.org/session-fixation-attack/
 */
export function regenerateSession(req: Express.Request, sessionStorage: Controller, webSocketServer: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    sessionStorage.removeWsHandshakeToken(req.session.id)
    const { userId, userEmail, wsHandshakeToken: oldToken } = req.session
    req.session.regenerate(err => {
      if (err) return reject(err)
      req.session.userId = userId
      req.session.userEmail = userEmail
      const newToken = uid.sync(24)
      console.log('oldToken', oldToken)
      console.log('newToken', newToken)
      // wsHandshakeToken should also be regenerated here.
      req.session.wsHandshakeToken = newToken
      sessionStorage.saveWsHandshakeToken(req.session.id, newToken)
      webSocketServer.fetchSockets()
        .then(sockets => {
          sockets.forEach(socket => {
            console.log('socket.handshake.auth.wsHandshakeToken', socket.handshake.auth.wsHandshakeToken)
            if (socket.handshake.auth.wsHandshakeToken === oldToken) {
              socket.handshake.auth.wsHandshakeToken = newToken
              console.log(`socket.handshake.auth.wsHandshakeToken is updated from ${oldToken} to ${newToken}`)
            }
          })
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
