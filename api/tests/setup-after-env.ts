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

let destroyApiApp: () => Promise<void>

beforeAll(async () => {
  globalThis.wsServer = getWsServer()
  const { apiApp, isReady: apiAppIsReady, destroy } = getApiApp(globalThis.wsServer)
  globalThis.apiApp = apiApp
  destroyApiApp = destroy
  globalThis.db = getDb()
  globalThis.sql = sql
  const { client, isReady: redisClientIsReady } = getClient()
  globalThis.redisClient = client
  await Promise.all([apiAppIsReady, redisClientIsReady])
  return
})

afterAll(async () => {
  await destroyApiApp()
  await new Promise(setImmediate)
  return
})
