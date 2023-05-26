import { RequestHandler } from 'express';
import getSessionStorage from '../services/sessionStorage';
import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';

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
const getWsAuthMiddleware = () => {
  const sessionStorage = getSessionStorage()

  return async (socket: Socket, next: (err?: ExtendedError) => void): Promise<void> => {
    try {
      const { wsHandshakeToken } = socket.handshake.auth
      if (!wsHandshakeToken) {
        socket.conn.send(JSON.stringify({message: 'Access denied. Handshake request does not have valid token.'}), undefined)
        socket.conn.close(true)
        return
      }
      const session = await sessionStorage.getSession(wsHandshakeToken)
      if (session === null) {
        socket.conn.send(JSON.stringify({message: 'Access denied. Handshake request does not have valid token.'}), undefined)
        socket.conn.close(true)
        return
      }
      if (session.userId === undefined) {
        throw new Error('Session does not have userId.')
      }
      socket.join(session.userId.toString())
      next()
    } catch (e) {
      console.error(e)
      next(new Error('Something went wrong.'))
    }
  }
}
export { getApiAuthMiddleware, getWsAuthMiddleware };
