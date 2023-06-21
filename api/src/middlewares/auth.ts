import { RequestHandler } from 'express';
import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import { SessionStorageClient } from '../services/sessionStorage/type';
import SessionStorageController from '../services/sessionStorage/controller';

const getApiAuthMiddleware: () => RequestHandler = () => {
  return (req, res, next) => {
    try {
      console.log(req.session)
      if (!req.session.userId) {
        return res.status(401).send({message: 'Access denied. Request is not authorized.'})
      }
      next()
    } catch (e) {
      next(e)
    }
  }
}
const getWsAuthMiddleware = (sessionStorageClient: SessionStorageClient, sessionStorageClientIsReady: Promise<void>) => {
  const sessionStorage = new SessionStorageController(sessionStorageClient, sessionStorageClientIsReady)
  return async (socket: Socket, next: (err?: ExtendedError) => void): Promise<void> => {
    try {
      const { wsHandshakeToken } = socket.handshake.auth
      if (!wsHandshakeToken) {
        // This line below won't affect wsServer tests, but you can see this line works by commenting this out and trying to connect the WebSocket without token.
        setTimeout(() => socket.conn.close(true))
        return next(new Error('Access denied. Handshake request does not have valid token.'))
      }
      const sessionId = await sessionStorage.getSessionId(wsHandshakeToken)
      if (sessionId === null) {
        // This line below won't affect wsServer tests, but you can see this line works by commenting this out and trying to connect the WebSocket with invalid token.
        setTimeout(() => socket.conn.close(true))
        return next(new Error('Access denied. Handshake request does not have valid token.'))
      }
      const session = await sessionStorage.getSession(sessionId)
      if (session === null) {
        // This line below won't affect wsServer tests, but you can see this line works by commenting this out and trying to connect the WebSocket with invalid token.
        setTimeout(() => socket.conn.close(true))
        return next(new Error('Access denied. Handshake request does not have valid token.'))
      }
      if (session.userId === undefined) {
        throw new Error('Session does not have userId.')
      }
      socket.join(session.userId)
      next()
    } catch (e) {
      console.error(e)
      next(new Error('Something went wrong.'))
    }
  }
}
export { getApiAuthMiddleware, getWsAuthMiddleware };
