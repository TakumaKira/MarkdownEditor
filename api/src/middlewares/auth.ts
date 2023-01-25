import { RequestHandler } from 'express';
import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import { AUTH_TOKEN_KEY, EMAIL_LENGTH_MAX } from '../constants';
import { JWT_SECRET_KEY } from '../getEnvs';
import decode from '../helper/decode';
import Joi from 'joi'
import { UserInfoOnAuthToken } from '../models/user';

const userInfoOnAuthTokenSchema = Joi.object<UserInfoOnAuthToken>({
  id: Joi.number().required(),
  email: Joi.string().required().email().max(EMAIL_LENGTH_MAX),
  is: Joi.equal('AuthToken').required(),
  iat: Joi.number().required(),
})

const apiAuthMiddleware: RequestHandler = (req, res, next) => {
  const token = req.header(AUTH_TOKEN_KEY)
  if (!token) {
    return res.status(401).send({message: 'Access denied. Request does not have valid token.'})
  }

  try {
    const tokenPayload = decode(token, JWT_SECRET_KEY)
    const result = userInfoOnAuthTokenSchema.validate(tokenPayload)
    if (result.error) {
      throw new Error('Token is not valid as an auth token.')
    }
    req.user = result.value
    next()
  } catch {
    res.status(401).send({message: 'Access denied. Request does not have valid token.'})
  }
}
const wsAuthMiddleware = (socket: Socket, next: (err?: ExtendedError) => void): void => {
  const token = socket.handshake.auth.token
  if (!token) {
    return next(new Error('Access denied. Request does not have valid token.'))
  }

  try {
    const tokenPayload = decode(token, JWT_SECRET_KEY)
    const result = userInfoOnAuthTokenSchema.validate(tokenPayload)
    if (result.error) {
      throw new Error('Token is not valid as an auth token.')
    }
    socket.user = result.value
    socket.join(socket.user.id.toString())
    next()
  } catch {
    next(new Error('Access denied. Request does not have valid token.'))
  }
}
export { apiAuthMiddleware, wsAuthMiddleware };
