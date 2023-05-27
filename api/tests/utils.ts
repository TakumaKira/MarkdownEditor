import request from 'supertest'
import cookie from 'cookie'
import { SESSION_SID_KEY, SESSION_MAX_AGE, REDIS_KEYS, WS_HANDSHAKE_TOKEN_KEY } from '../src/constants'
import { getRedisKeyName } from '../src/services/sessionStorage/utils'

import { sql } from '@databases/mysql';
import getApiApp from '../src/servers/apiServer/apiApp'
import getWsServer from '../src/servers/wsServer'
import getDb from '../src/services/database/connector'
import getClient from "../src/services/sessionStorage/getClient"

export async function setupApiAppForTest() {
  globalThis.wsServer = getWsServer()
  const { apiApp, isReady: apiAppIsReady, destroy } = getApiApp(globalThis.wsServer)
  globalThis.apiApp = apiApp
  globalThis.destroyApiApp = destroy
  globalThis.db = getDb()
  globalThis.sql = sql
  const { client, isReady: redisClientIsReady } = getClient()
  globalThis.redisClient = client
  await Promise.all([apiAppIsReady, redisClientIsReady])
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
  const sessionStr = await redisClient.get(getRedisKeyName(REDIS_KEYS.SESSION, sessionId!))
  expect(sessionStr).toBeTruthy()
  const session: Express.Request['session'] = JSON.parse(sessionStr!)
  expect(session.userEmail).toBe(email)
  expect(res.headers[WS_HANDSHAKE_TOKEN_KEY]).toBe(session.wsHandshakeToken)
}

function retrieveSessionId(connectSid: string | undefined): string | undefined {
  return connectSid?.match(/s:([^\.]+)/)?.[1]
}
