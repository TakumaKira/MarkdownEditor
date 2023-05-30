import request from 'supertest'
import cookie from 'cookie'
import { sql } from '@databases/mysql';
import { SESSION_SID_KEY, SESSION_MAX_AGE, REDIS_KEYS, WS_HANDSHAKE_TOKEN_KEY } from '../src/constants'
import { getRedisKeyName } from '../src/services/sessionStorage/utils'
import getWsServer from '../src/servers/wsServer'
import getDBClient from '../src/services/database/client'
import getSessionStorageClient from '../src/services/sessionStorage/client'
import getApiApp from "../src/servers/apiServer/apiApp"

/**
 * Setup apiApp / wsServer / dbClient / sessionStorageClient.
 */
export async function setupApiAppForTest() {
  const { sessionStorageClient, closeSessionStorageClient, sessionStorageClientIsReady } = getSessionStorageClient()
  const { wsServer, closeWsServer } = getWsServer(sessionStorageClient, sessionStorageClientIsReady)
  const { dbClient, closeDBClient } = getDBClient()
  const apiApp = getApiApp(wsServer, dbClient, sessionStorageClient, sessionStorageClientIsReady)

  globalThis.apiApp = apiApp
  globalThis.wsServer = wsServer
  globalThis.dbClient = dbClient
  globalThis.sql = sql
  globalThis.sessionStorageClient = sessionStorageClient
  globalThis.sessionStorageClientIsReady = sessionStorageClientIsReady

  await sessionStorageClientIsReady

  globalThis.closeWsServer = closeWsServer
  globalThis.closeDBClient = closeDBClient
  globalThis.closeSessionStorageClient = closeSessionStorageClient
}
/**
 * Close apiApp / wsServer / dbClient / sessionStorageClient.
 */
export async function closeApiAppForTest() {
  await Promise.all([
    globalThis.closeWsServer(),
    globalThis.closeDBClient(),
    globalThis.closeSessionStorageClient(),
  ])
}

/**
 * Setup wsServer / sessionStorageClient.
 */
export async function setupWsServerForTest() {
  const { sessionStorageClient, closeSessionStorageClient, sessionStorageClientIsReady } = getSessionStorageClient()
  const { wsServer, closeWsServer } = getWsServer(sessionStorageClient, sessionStorageClientIsReady)

  globalThis.wsServer = wsServer
  globalThis.sessionStorageClient = sessionStorageClient
  globalThis.sessionStorageClientIsReady = sessionStorageClientIsReady

  await sessionStorageClientIsReady

  globalThis.closeWsServer = closeWsServer
  globalThis.closeSessionStorageClient = closeSessionStorageClient
}
/**
 * Close wsServer / sessionStorageClient.
 */
export async function closeWsServerForTest() {
  await Promise.all([
    globalThis.closeWsServer(),
    globalThis.closeSessionStorageClient(),
  ])
}

/**
 * Setup dbClient.
 */
export async function setupDbClientForTest() {
  const { dbClient, closeDBClient } = getDBClient()
  globalThis.dbClient = dbClient
  globalThis.sql = sql

  globalThis.closeDBClient = closeDBClient
}
/**
 * Close dbClient.
 */
export async function closeDbClientForTest() {
  await globalThis.closeDBClient()
}

/**
 * Setup sessionStorageClient.
 */
export async function setupRedisClientForTest() {
  const { sessionStorageClient, closeSessionStorageClient, sessionStorageClientIsReady } = getSessionStorageClient()

  globalThis.sessionStorageClient = sessionStorageClient
  globalThis.sessionStorageClientIsReady = sessionStorageClientIsReady

  await sessionStorageClientIsReady

  globalThis.closeSessionStorageClient = closeSessionStorageClient
}
/**
 * Close sessionStorageClient.
 */
export async function closeRedisClientForTest() {
  await globalThis.closeSessionStorageClient()
}

export async function assertSession(res: request.Response, email: string) {
  const setCookieHeaders: string[] = res.headers['set-cookie']
  const cookies = setCookieHeaders.map(headerValue => cookie.parse(headerValue))
  const sessionCookieIndex = cookies.findIndex((cookie: any) => cookie.hasOwnProperty(SESSION_SID_KEY))
  const hasHttpOnlyFlag = setCookieHeaders[sessionCookieIndex].includes('HttpOnly')
  expect(hasHttpOnlyFlag).toBe(true)
  const expires = cookies[sessionCookieIndex]?.['Expires']
  expect(expires).not.toBeUndefined()
  const expirationDate = new Date(expires).getTime()
  expect(expirationDate).not.toBeNaN()
  const now = new Date().getTime()
  const diff = expirationDate - now
  expect(diff).toBeGreaterThan(0)
  expect(diff).toBeLessThan(SESSION_MAX_AGE)
  expect(cookies[sessionCookieIndex]?.['SameSite']).toBe('Strict')
  const connectSid: string | undefined = cookies[sessionCookieIndex]?.[SESSION_SID_KEY];
  const sessionId = retrieveSessionId(connectSid)
  expect(sessionId).toBeTruthy()
  const sessionStr = await sessionStorageClient.get(getRedisKeyName(REDIS_KEYS.SESSION, sessionId!))
  expect(sessionStr).toBeTruthy()
  const session: Express.Request['session'] = JSON.parse(sessionStr!)
  expect(session.userEmail).toBe(email)
  expect(res.headers[WS_HANDSHAKE_TOKEN_KEY]).toBe(session.wsHandshakeToken)
}

function retrieveSessionId(connectSid: string | undefined): string | undefined {
  return connectSid?.match(/s:([^\.]+)/)?.[1]
}
