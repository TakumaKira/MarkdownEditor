/*
jest is available here.
beforeAll in this file runs before each test file's beforeAll.
afterAll in this file runs before each test file's afterAll.
*/

const mockSend = jest.fn()
jest.mock('../src/getEnvs', () => ({
  ...jest.requireActual('../src/getEnvs'),
  getMailServer: () => ({
    send: mockSend
  })
}))

import { sql } from '@databases/mysql';
import getApiApp from '../src/servers/apiServer/apiApp'
import getWsServer from '../src/servers/wsServer'
import getDb from '../src/services/database/connector'
import getClient from "../src/services/sessionStorage/getClient"

beforeAll(async () => {
  // Global set ups
  globalThis.wsServer = getWsServer()
  const { apiApp, isReady: apiAppIsReady, destroy } = getApiApp(globalThis.wsServer)
  globalThis.apiApp = apiApp
  globalThis.destroyApiApp = destroy
  globalThis.db = getDb()
  globalThis.sql = sql
  const { client, isReady: redisClientIsReady } = getClient()
  globalThis.redisClient = client
  await Promise.all([apiAppIsReady, redisClientIsReady])
  return
})

afterAll(async () => {
  // Global tear downs
  await new Promise(setImmediate)
  return
})
