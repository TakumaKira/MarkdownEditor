import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { Socket } from 'socket.io'
import { JWT_SECRET_KEY } from '../../../src/getEnvs'
import { apiAuthMiddleware, wsAuthMiddleware } from "../../../src/middlewares/auth"

describe('apiAuthMiddleware', () => {
  // requests with valid token
  test('triggers next() with validated user info if passed valid token', () => {
    const userId = 1
    const userEmail = 'test@email.com'
    const token = jwt.sign(
      {is: 'AuthToken', id: userId, email: userEmail},
      JWT_SECRET_KEY
    )
    const header = jest.fn().mockReturnValue(token)
    const req = {header} as unknown as Request
    const send = jest.fn()
    const status = jest.fn().mockReturnValue({send})
    const res = {status} as unknown as Response
    const next = jest.fn()
    apiAuthMiddleware(req, res, next)
    expect(status).not.toBeCalled()
    expect(send).not.toBeCalled()
    expect(next).toBeCalledWith()
    expect(req.user).toEqual({id: userId, email: userEmail, is: 'AuthToken', iat: expect.any(Number)})
  })

  // requests with invalid token
  test('triggers status() and send() with error message if no auth token provided', () => {
    const header = jest.fn().mockReturnValue(undefined)
    const req = {header} as unknown as Request
    const send = jest.fn()
    const status = jest.fn().mockReturnValue({send})
    const res = {status} as unknown as Response
    const next = jest.fn()
    apiAuthMiddleware(req, res, next)
    expect(status).toBeCalledWith(401)
    expect(send).toBeCalledWith({message: 'Access denied. Request does not have valid token.'})
    expect(next).not.toBeCalled()
    expect(req.user).toEqual(undefined)
  })

  test('triggers status() and send() with error message if auth token is not valid', () => {
    const userId = 1
    const userEmail = 'test@email.com'
    const token = jwt.sign(
      {is: 'AuthToken', id: userId, email: userEmail},
      JWT_SECRET_KEY
    )
    const header = jest.fn().mockReturnValue(`${token}1`)
    const req = {header} as unknown as Request
    const send = jest.fn()
    const status = jest.fn().mockReturnValue({send})
    const res = {status} as unknown as Response
    const next = jest.fn()
    apiAuthMiddleware(req, res, next)
    expect(status).toBeCalledWith(401)
    expect(send).toBeCalledWith({message: 'Access denied. Request does not have valid token.'})
    expect(next).not.toBeCalled()
    expect(req.user).toEqual(undefined)
  })

  test('triggers status() and send() with error message if given token is not encoded with right secret', () => {
    const userId = 1
    const userEmail = 'test@email.com'
    const invalidToken = jwt.sign(
      {is: 'AuthToken', id: userId, email: userEmail},
      `${JWT_SECRET_KEY}1`
    )
    const header = jest.fn().mockReturnValue(invalidToken)
    const req = {header} as unknown as Request
    const send = jest.fn()
    const status = jest.fn().mockReturnValue({send})
    const res = {status} as unknown as Response
    const next = jest.fn()
    apiAuthMiddleware(req, res, next)
    expect(status).toBeCalledWith(401)
    expect(send).toBeCalledWith({message: 'Access denied. Request does not have valid token.'})
    expect(next).not.toBeCalled()
    expect(req.user).toEqual(undefined)
  })

  test('triggers status() and send() with error message if given token is not authToken', () => {
    const userId = 1
    const userEmail = 'test@email.com'
    const notAuthToken = jwt.sign(
      {is: 'SignupToken', id: userId, email: userEmail},
      JWT_SECRET_KEY
    )
    const header = jest.fn().mockReturnValue(notAuthToken)
    const req = {header} as unknown as Request
    const send = jest.fn()
    const status = jest.fn().mockReturnValue({send})
    const res = {status} as unknown as Response
    const next = jest.fn()
    apiAuthMiddleware(req, res, next)
    expect(status).toBeCalledWith(401)
    expect(send).toBeCalledWith({message: 'Access denied. Request does not have valid token.'})
    expect(next).not.toBeCalled()
    expect(req.user).toEqual(undefined)
  })

  test('triggers status() and send() with error message if given token has too long email', () => {
    const userId = 1
    const tooLongUserEmail = 'abcdefghijabcdefghijabcdefghijabcdefghi@abcdefg.com'
    const authTokenWithTooLongEmail = jwt.sign(
      {is: 'AuthToken', id: userId, email: tooLongUserEmail},
      JWT_SECRET_KEY
    )
    const header = jest.fn().mockReturnValue(authTokenWithTooLongEmail)
    const req = {header} as unknown as Request
    const send = jest.fn()
    const status = jest.fn().mockReturnValue({send})
    const res = {status} as unknown as Response
    const next = jest.fn()
    apiAuthMiddleware(req, res, next)
    expect(status).toBeCalledWith(401)
    expect(send).toBeCalledWith({message: 'Access denied. Request does not have valid token.'})
    expect(next).not.toBeCalled()
    expect(req.user).toEqual(undefined)
  })

  test('triggers next() with validated user info if passed valid token with not too long email', () => {
    const userId = 1
    const notTooLongUserEmail = 'abcdefghijabcdefghijabcdefghijabcdefghi@abcdef.com'
    const token = jwt.sign(
      {is: 'AuthToken', id: userId, email: notTooLongUserEmail},
      JWT_SECRET_KEY
    )
    const header = jest.fn().mockReturnValue(token)
    const req = {header} as unknown as Request
    const send = jest.fn()
    const status = jest.fn().mockReturnValue({send})
    const res = {status} as unknown as Response
    const next = jest.fn()
    apiAuthMiddleware(req, res, next)
    expect(status).not.toBeCalled()
    expect(send).not.toBeCalled()
    expect(next).toBeCalledWith()
    expect(req.user).toEqual({id: userId, email: notTooLongUserEmail, is: 'AuthToken', iat: expect.any(Number)})
  })

  test('triggers status() and send() with error message if given token has invalid email', () => {
    const userId = 1
    const invalidUserEmail = 'invalid@'
    const authTokenWithInvalidEmail = jwt.sign(
      {is: 'AuthToken', id: userId, email: invalidUserEmail},
      JWT_SECRET_KEY
    )
    const header = jest.fn().mockReturnValue(authTokenWithInvalidEmail)
    const req = {header} as unknown as Request
    const send = jest.fn()
    const status = jest.fn().mockReturnValue({send})
    const res = {status} as unknown as Response
    const next = jest.fn()
    apiAuthMiddleware(req, res, next)
    expect(status).toBeCalledWith(401)
    expect(send).toBeCalledWith({message: 'Access denied. Request does not have valid token.'})
    expect(next).not.toBeCalled()
    expect(req.user).toEqual(undefined)
  })
})

describe('wsAuthMiddleware', () => {
  // requests with valid token
  test('triggers next() with validated user info and socket.join() if passed valid token', () => {
    const userId = 1
    const userEmail = 'test@email.com'
    const token = jwt.sign(
      {is: 'AuthToken', id: userId, email: userEmail},
      JWT_SECRET_KEY
    )
    const next = jest.fn()
    const join = jest.fn()
    const socket = { handshake: { auth: { token } }, join } as unknown as Socket
    wsAuthMiddleware(socket, next)
    expect(next).toBeCalledWith()
    expect(join).toBeCalledWith(userId.toString())
    expect(socket.user).toEqual({id: userId, email: userEmail, is: 'AuthToken', iat: expect.any(Number)})
  })

  // requests with invalid token
  test('triggers next() with with error if no auth token provided', () => {
    const next = jest.fn()
    const join = jest.fn()
    const socket = { handshake: { auth: {} }, join } as unknown as Socket
    wsAuthMiddleware(socket, next)
    expect(next).toBeCalledWith(new Error('Access denied. Request does not have valid token.'))
    expect(join).not.toBeCalled()
    expect(socket.user).toEqual(undefined)
  })

  test('triggers next() with with error if auth token is not valid', () => {
    const userId = 1
    const userEmail = 'test@email.com'
    const token = jwt.sign(
      {is: 'AuthToken', id: userId, email: userEmail},
      JWT_SECRET_KEY
    )
    const next = jest.fn()
    const join = jest.fn()
    const socket = { handshake: { auth: { token: `${token}1` } }, join } as unknown as Socket
    wsAuthMiddleware(socket, next)
    expect(next).toBeCalledWith(new Error('Access denied. Request does not have valid token.'))
    expect(join).not.toBeCalled()
    expect(socket.user).toEqual(undefined)
  })

  test('triggers next() with with error if given token is not encoded with right secret', () => {
    const userId = 1
    const userEmail = 'test@email.com'
    const invalidToken = jwt.sign(
      {is: 'AuthToken', id: userId, email: userEmail},
      `${JWT_SECRET_KEY}1`
    )
    const next = jest.fn()
    const join = jest.fn()
    const socket = { handshake: { auth: { token: invalidToken } }, join } as unknown as Socket
    wsAuthMiddleware(socket, next)
    expect(next).toBeCalledWith(new Error('Access denied. Request does not have valid token.'))
    expect(join).not.toBeCalled()
    expect(socket.user).toEqual(undefined)
  })

  test('triggers next() with with error if given token is not authToken', () => {
    const userId = 1
    const userEmail = 'test@email.com'
    const notAuthToken = jwt.sign(
      {is: 'SignupToken', id: userId, email: userEmail},
      JWT_SECRET_KEY
    )
    const next = jest.fn()
    const join = jest.fn()
    const socket = { handshake: { auth: { token: notAuthToken } }, join } as unknown as Socket
    wsAuthMiddleware(socket, next)
    expect(next).toBeCalledWith(new Error('Access denied. Request does not have valid token.'))
    expect(join).not.toBeCalled()
    expect(socket.user).toEqual(undefined)
  })

  test('triggers next() with with error if given token has too long email', () => {
    const userId = 1
    const tooLongUserEmail = 'abcdefghijabcdefghijabcdefghijabcdefghi@abcdefg.com'
    const authTokenWithTooLongUserMail = jwt.sign(
      {is: 'AuthToken', id: userId, email: tooLongUserEmail},
      JWT_SECRET_KEY
    )
    const next = jest.fn()
    const join = jest.fn()
    const socket = { handshake: { auth: { token: authTokenWithTooLongUserMail } }, join } as unknown as Socket
    wsAuthMiddleware(socket, next)
    expect(next).toBeCalledWith(new Error('Access denied. Request does not have valid token.'))
    expect(join).not.toBeCalled()
    expect(socket.user).toEqual(undefined)
  })

  test('triggers next() with validated user info and socket.join() if passed valid token with not too long email', () => {
    const userId = 1
    const notTooLongUserEmail = 'abcdefghijabcdefghijabcdefghijabcdefghi@abcdef.com'
    const token = jwt.sign(
      {is: 'AuthToken', id: userId, email: notTooLongUserEmail},
      JWT_SECRET_KEY
    )
    const next = jest.fn()
    const join = jest.fn()
    const socket = { handshake: { auth: { token } }, join } as unknown as Socket
    wsAuthMiddleware(socket, next)
    expect(next).toBeCalledWith()
    expect(join).toBeCalledWith(userId.toString())
    expect(socket.user).toEqual({id: userId, email: notTooLongUserEmail, is: 'AuthToken', iat: expect.any(Number)})
  })

  test('triggers next() with with error if given token has invalid email', () => {
    const userId = 1
    const invalidUserEmail = 'invalid@'
    const authTokenWithInvalidUserMail = jwt.sign(
      {is: 'AuthToken', id: userId, email: invalidUserEmail},
      JWT_SECRET_KEY
    )
    const next = jest.fn()
    const join = jest.fn()
    const socket = { handshake: { auth: { token: authTokenWithInvalidUserMail } }, join } as unknown as Socket
    wsAuthMiddleware(socket, next)
    expect(next).toBeCalledWith(new Error('Access denied. Request does not have valid token.'))
    expect(join).not.toBeCalled()
    expect(socket.user).toEqual(undefined)
  })
})
