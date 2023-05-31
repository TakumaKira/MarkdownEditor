import { io } from 'socket.io-client'
import uid from 'uid-safe'
import { WS_PORT } from "../../../../src/getEnvs"
import { wsServerForTest } from '../../../utils'
import { getRedisKeyName } from '../../../../src/services/sessionStorage'
import { REDIS_KEYS } from '../../../../src/constants'

const TESTING_WS_SERVER_AP = `ws://localhost:${WS_PORT}`

const mainUser = {
  sessionId: uid.sync(24),
  wsHandshakeToken: uid.sync(24),
  session: {
    userId: '1'
  }
}
const otherUser = {
  sessionId: uid.sync(24),
  wsHandshakeToken: uid.sync(24),
  session: {
    userId: '2'
  }
}

beforeAll(async () => {
  await wsServerForTest.setup()
  await Promise.all([
    sessionStorageClient.set(getRedisKeyName(REDIS_KEYS.SESSION, mainUser.sessionId), JSON.stringify(mainUser.session)),
    sessionStorageClient.set(getRedisKeyName(REDIS_KEYS.SESSION, otherUser.sessionId), JSON.stringify(otherUser.session)),
    sessionStorageClient.set(getRedisKeyName(REDIS_KEYS.WS_HANDSHAKE_TOKEN, mainUser.wsHandshakeToken), mainUser.sessionId),
    sessionStorageClient.set(getRedisKeyName(REDIS_KEYS.WS_HANDSHAKE_TOKEN, otherUser.wsHandshakeToken), otherUser.sessionId),
  ])
})
afterAll(async () => {
  await wsServerForTest.close()
  await new Promise(setImmediate)
})

describe('wsServer', () => {
  test('emits connect_error when no AuthToken is provided', done => {
    const clientSocket = io(TESTING_WS_SERVER_AP, {autoConnect: false})
    clientSocket.on('connect_error', err => {
      expect(err instanceof Error).toBe(true)
      expect(err.message).toBe('Access denied. Handshake request does not have valid token.')
      console.log('TODO: Assert disconnected.')
      clientSocket.close()
      done()
    })
    clientSocket.connect()
  })

  test('emits connect_error when invalid wsHandshakeToken is provided', done => {
    const clientSocket = io(TESTING_WS_SERVER_AP, {autoConnect: false, auth: {wsHandshakeToken: `${mainUser.wsHandshakeToken}1`}})
    clientSocket.on('connect_error', err => {
      expect(err instanceof Error).toBe(true)
      expect(err.message).toBe('Access denied. Handshake request does not have valid token.')
      console.log('TODO: Assert disconnected.')
      clientSocket.close()
      done()
    })
    clientSocket.connect()
  })

  test('cannot get message if client did not provide valid wsHandshakeToken', done => {
    const testFn = jest.fn()
    const clientSocket = io(TESTING_WS_SERVER_AP, {autoConnect: false, auth: {wsHandshakeToken: `${mainUser.wsHandshakeToken}1`}})
    const eventName = 'test'
    const message = 'test message'
    clientSocket.on(eventName, arg => testFn(arg))
    clientSocket.connect()
    setTimeout(() => {
      wsServer.to(mainUser.session.userId).emit(eventName, message)
      setTimeout(() => {
        expect(testFn).not.toBeCalled()
        clientSocket.close()
        done()
      }, 100)
    }, 100)
  })

  test('cannot get message if the message emitted to another user', done => {
    const testFn = jest.fn()
    const clientSocket = io(TESTING_WS_SERVER_AP, {autoConnect: false, auth: {wsHandshakeToken: mainUser.wsHandshakeToken}})
    const eventName = 'test'
    const message = 'test message'
    clientSocket.on(eventName, arg => testFn(arg))
    clientSocket.connect()
    setTimeout(() => {
      wsServer.to(otherUser.session.userId).emit(eventName, message)
      setTimeout(() => {
        expect(testFn).not.toBeCalled()
        clientSocket.close()
        done()
      }, 100)
    }, 100)
  })

  test('gets message if the message emitted to the user', done => {
    const testFn = jest.fn()
    const clientSocket = io(TESTING_WS_SERVER_AP, {autoConnect: false, auth: {wsHandshakeToken: mainUser.wsHandshakeToken}})
    const eventName = 'test'
    const message = 'test message'
    clientSocket.on(eventName, arg => testFn(arg))
    clientSocket.connect()
    setTimeout(() => {
      wsServer.to(mainUser.session.userId).emit(eventName, message)
      setTimeout(() => {
        expect(testFn).toBeCalledWith(message)
        clientSocket.close()
        done()
      }, 100)
    }, 100)
  })
})
