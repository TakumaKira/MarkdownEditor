import { RequestHandler } from 'express';
import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import { AUTH_TOKEN_KEY } from '../constants';
import { JWT_SECRET_KEY } from '../getEnvs';
import decode from '../helper/decode';

const authApiMiddleware: RequestHandler = (req, res, next) => {
  const token = req.header(AUTH_TOKEN_KEY)
  if (!token) {
    return res.status(401).send({message: 'Access denied. Request does not have valid token.'})
  }

  try {
    req.user = decode(token, JWT_SECRET_KEY)
    if (req.user.is !== 'AuthToken') {
      throw new Error('Token is not valid as an auth token.')
    }
    next()
  } catch {
    res.status(401).send({message: 'Access denied. Request does not have valid token.'})
  }
}
const authWsMiddleware = (socket: Socket, next: (err?: ExtendedError) => void): void => {
  const token = socket.handshake.auth.token
  if (!token) {
    return next(new Error('Access denied. Request does not have valid token.'))
  }

  try {
    socket.user = decode(token, JWT_SECRET_KEY)
    if (socket.user.is !== 'AuthToken') {
      throw new Error('Token is not valid as an auth token.')
    }
    socket.join(socket.user.id.toString())
    next()
  } catch {
    next(new Error('Access denied. Request does not have valid token.'))
  }
}
export { authApiMiddleware, authWsMiddleware };
