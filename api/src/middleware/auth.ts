import { RequestHandler } from 'express';
import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import { AUTH_TOKEN_KEY } from '../constants';
import decode from '../helper/decode';

const authApiMiddleware: RequestHandler = (req, res, next) => {
  const token = req.header(AUTH_TOKEN_KEY)
  if (!token) {
    return res.status(401).send({message: 'Access denied. No token provided.'})
  }

  if (!process.env.JWT_SECRET_KEY) {
    console.error('JWT_SECRET_KEY is not defined.')
    return res.status(500).send({message: 'Something went wrong.'})
  }

  try {
    req.user = decode(token, process.env.JWT_SECRET_KEY)
    if (!req.user.isValidAuthToken) return res.status(401).send({message: 'This user is not activated.'})
    next()
  } catch (ex) {
    console.error(ex)
    res.status(400).send({message: 'Invalid token.'})
  }
}
const authWsMiddleware = (socket: Socket, next: (err?: ExtendedError) => void): void => {
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
export { authApiMiddleware, authWsMiddleware };

