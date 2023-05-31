import { RequestHandler } from 'express';
import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import { SessionStorageClient } from '../services/sessionStorage/type';
import SessionStorageController from '../services/sessionStorage/controller';

const getApiAuthMiddleware: () => RequestHandler = () => {
  return (req, res, next) => {
    try {
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
        setTimeout(() => socket.conn.close(true))
        return next(new Error('Access denied. Handshake request does not have valid token.'))
      }
      const session = await sessionStorage.getSession(wsHandshakeToken)
      if (session === null) {
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
