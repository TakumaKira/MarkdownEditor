import { io } from 'socket.io-client'
import jwt from 'jsonwebtoken'
import { JWT_SECRET_KEY, WS_PORT } from "../../../../src/getEnvs"
import wsServer from '../../../../src/servers/wsServer'

describe('wsServer', () => {
  const TESTING_WS_SERVER_AP = `ws://localhost:${WS_PORT}`

  test('emits connect_error when no AuthToken is provided', done => {
    const clientSocket = io(TESTING_WS_SERVER_AP, {autoConnect: false})
    clientSocket.on('connect_error', err => {
      expect(err instanceof Error).toBe(true)
      expect(err.message).toBe('Access denied. Request does not have valid token.')
      clientSocket.close()
      done()
    })
    clientSocket.connect()
  })

  test('emits connect_error when invalid AuthToken is provided', done => {
    const validAuthToken = jwt.sign(
      {is: 'AuthToken', id: 1, email: 'test@email.com'},
      JWT_SECRET_KEY
    )
    const clientSocket = io(TESTING_WS_SERVER_AP, {autoConnect: false, auth: {token: `${validAuthToken}1`}})
    clientSocket.on('connect_error', err => {
      expect(err instanceof Error).toBe(true)
      expect(err.message).toBe('Access denied. Request does not have valid token.')
      clientSocket.close()
      done()
    })
    clientSocket.connect()
  })

  test('emits connect_error when AuthToken is provided with incorrect secret', done => {
    const invalidAuthToken = jwt.sign(
      {is: 'AuthToken', id: 1, email: 'test@email.com'},
      `${JWT_SECRET_KEY}1`
    )
    const clientSocket = io(TESTING_WS_SERVER_AP, {autoConnect: false, auth: {token: invalidAuthToken}})
    clientSocket.on('connect_error', err => {
      expect(err instanceof Error).toBe(true)
      expect(err.message).toBe('Access denied. Request does not have valid token.')
      clientSocket.close()
      done()
    })
    clientSocket.connect()
  })

  test('emits connect_error when provided token is not AuthToken', done => {
    const notAuthToken = jwt.sign(
      {is: 'SignupToken', id: 1, email: 'test@email.com'},
      JWT_SECRET_KEY
    )
    const clientSocket = io(TESTING_WS_SERVER_AP, {autoConnect: false, auth: {token: notAuthToken}})
    clientSocket.on('connect_error', err => {
      expect(err instanceof Error).toBe(true)
      expect(err.message).toBe('Access denied. Request does not have valid token.')
      clientSocket.close()
      done()
    })
    clientSocket.connect()
  })

  test('cannot get message if client did not provide valid AuthToken', done => {
    const testFn = jest.fn()
    const userId = 1
    const invalidAuthToken = jwt.sign(
      {is: 'AuthToken', id: userId, email: 'test@email.com'},
      `${JWT_SECRET_KEY}1`
    )
    const clientSocket = io(TESTING_WS_SERVER_AP, {autoConnect: false, auth: {token: invalidAuthToken}})
    const eventName = 'test'
    const message = 'test message'
    clientSocket.on(eventName, arg => testFn(arg))
    clientSocket.connect()
    setTimeout(() => {
      wsServer.to(userId.toString()).emit(eventName, message)
      setTimeout(() => {
        expect(testFn).not.toBeCalled()
        clientSocket.close()
        done()
      }, 100)
    }, 100)
  })

  test('cannot get message if the message emitted to another user', done => {
    const testFn = jest.fn()
    const userId = 1
    const anotherUserId = 2
    const validAuthToken = jwt.sign(
      {is: 'AuthToken', id: userId, email: 'test@email.com'},
      JWT_SECRET_KEY
    )
    const clientSocket = io(TESTING_WS_SERVER_AP, {autoConnect: false, auth: {token: validAuthToken}})
    const eventName = 'test'
    const message = 'test message'
    clientSocket.on(eventName, arg => testFn(arg))
    clientSocket.connect()
    setTimeout(() => {
      wsServer.to(anotherUserId.toString()).emit(eventName, message)
      setTimeout(() => {
        expect(testFn).not.toBeCalled()
        clientSocket.close()
        done()
      }, 100)
    }, 100)
  })

  test('gets message if the message emitted to the user', done => {
    const testFn = jest.fn()
    const userId = 1
    const validAuthToken = jwt.sign(
      {is: 'AuthToken', id: userId, email: 'test@email.com'},
      JWT_SECRET_KEY
    )
    const clientSocket = io(TESTING_WS_SERVER_AP, {autoConnect: false, auth: {token: validAuthToken}})
    const eventName = 'test'
    const message = 'test message'
    clientSocket.on(eventName, arg => testFn(arg))
    clientSocket.connect()
    setTimeout(() => {
      wsServer.to(userId.toString()).emit(eventName, message)
      setTimeout(() => {
        expect(testFn).toBeCalledWith(message)
        clientSocket.close()
        done()
      }, 100)
    }, 100)
  })
})
