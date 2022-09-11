import { RequestHandler } from 'express';
import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import { AUTH_TOKEN_KEY } from '../constants';
import decode from '../helper/decode';

const authApi: RequestHandler = (req, res, next) => {
  const token = req.header(AUTH_TOKEN_KEY)
  if (!token) {
    return res.status(401).send('Access denied. No token provided.')
  }

  if (!process.env.JWT_SECRET_KEY) {
    console.error('JWT_SECRET_KEY is not defined.')
    return res.status(500).send('Something went wrong.')
  }

  try {
    req.user = decode(token, process.env.JWT_SECRET_KEY)
    next()
  } catch (ex) {
    console.error(ex)
    res.status(400).send('Invalid token.')
  }
}
const authWs = (socket: Socket, next: (err?: ExtendedError) => void): void => {
  const token = socket.handshake.auth.token
  if (!token) {
    return next(new Error('Access denied. No token provided.'))
  }

  if (!process.env.JWT_SECRET_KEY) {
    console.error('JWT_SECRET_KEY is not defined.')
    return next(new Error('Something went wrong.'))
  }

  try {
    socket.user = decode(token, process.env.JWT_SECRET_KEY)
    socket.join(socket.user.id.toString())
    next()
  } catch (ex) {
    console.error(ex)
    next(new Error('Invalid token.'))
  }
}
export { authApi, authWs };

