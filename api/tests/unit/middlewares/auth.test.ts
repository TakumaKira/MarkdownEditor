import { Request, Response } from 'express'
import { Socket } from 'socket.io'
import uid from 'uid-safe'
import { getApiAuthMiddleware, getWsAuthMiddleware } from "../../../src/middlewares/auth"
import { sessionStorageClientForTest } from '../../utils'
import { getRedisKeyName } from '../../../src/services/sessionStorage'
import { REDIS_KEYS } from '../../../src/constants'

const validSession = {
  sessionId: uid.sync(24),
  wsHandshakeToken: uid.sync(24),
  session: {
    userId: '1'
  }
}

beforeAll(async () => {
  await sessionStorageClientForTest.setup()
  await Promise.all([
    sessionStorageClient.set(getRedisKeyName(REDIS_KEYS.SESSION, validSession.sessionId), JSON.stringify(validSession.session)),
    sessionStorageClient.set(getRedisKeyName(REDIS_KEYS.WS_HANDSHAKE_TOKEN, validSession.wsHandshakeToken), validSession.sessionId),
  ])
})
afterAll(async () => {
  await sessionStorageClientForTest.close()
  await new Promise(setImmediate)
})

describe('apiAuthMiddleware', () => {
  // requests with valid session
  test('triggers next() if passed valid session info by session middleware', () => {
    const userId = 1
    const req = {session: {userId}} as unknown as Request
    const send = jest.fn()
    const status = jest.fn().mockReturnValue({send})
    const res = {status} as unknown as Response
    const next = jest.fn()
    getApiAuthMiddleware()(req, res, next)
    expect(status).not.toBeCalled()
    expect(send).not.toBeCalled()
    expect(next).toBeCalledWith()
  })

  // requests with invalid token
  test('triggers status() and send() with error message if no valid session provided by session middleware', () => {
    const req = {session: {}} as unknown as Request
    const send = jest.fn()
    const status = jest.fn().mockReturnValue({send})
    const res = {status} as unknown as Response
    const next = jest.fn()
    getApiAuthMiddleware()(req, res, next)
    expect(status).toBeCalledWith(401)
    expect(send).toBeCalledWith({message: 'Access denied. Request is not authorized.'})
    expect(next).not.toBeCalled()
  })
})

describe('wsAuthMiddleware', () => {
  // requests with valid token
  test('triggers next() with validated user info and socket.join() if passed valid wsHandshakeToken', async () => {
    const next = jest.fn()
    const join = jest.fn()
    const close = jest.fn()
    const socket = {
      handshake: { auth: { wsHandshakeToken: validSession.wsHandshakeToken } },
      join,
      conn: { close }
    } as unknown as Socket
    await getWsAuthMiddleware(sessionStorageClient, sessionStorageClientIsReady)(socket, next)
    expect(next).toBeCalledWith()
    expect(join).toBeCalledWith(validSession.session.userId)
    await new Promise(resolve => setTimeout(resolve, 10))
    expect(close).not.toBeCalled()
  })

  // requests with invalid token
  test('triggers next() with with error if no wsHandshakeToken provided', async () => {
    const next = jest.fn()
    const join = jest.fn()
    const close = jest.fn()
    const socket = {
      handshake: { auth: {} },
      join,
      conn: { close }
    } as unknown as Socket
    await getWsAuthMiddleware(sessionStorageClient, sessionStorageClientIsReady)(socket, next)
    expect(next).toBeCalledWith(new Error('Access denied. Handshake request does not have valid token.'))
    expect(join).not.toBeCalled()
    await new Promise(resolve => setTimeout(resolve, 10))
    expect(close).toBeCalled()
  })

  test('triggers next() with with error if wsHandshakeToken is not valid', async () => {
    const next = jest.fn()
    const join = jest.fn()
    const close = jest.fn()
    const socket = {
      handshake: { auth: { wsHandshakeToken: `${validSession.wsHandshakeToken}1` } },
      join,
      conn: { close }
    } as unknown as Socket
    await getWsAuthMiddleware(sessionStorageClient, sessionStorageClientIsReady)(socket, next)
    expect(next).toBeCalledWith(new Error('Access denied. Handshake request does not have valid token.'))
    expect(join).not.toBeCalled()
    await new Promise(resolve => setTimeout(resolve, 10))
    expect(close).toBeCalled()
  })
})
