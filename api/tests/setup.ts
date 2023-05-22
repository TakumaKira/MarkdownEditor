import getApiApp from '../src/servers/apiServer/apiApp'
import getWsServer from '../src/servers/wsServer'
import { sql } from '@databases/mysql';
import getDb from '../src/services/database/connector'
import getClient from "../src/services/sessionStorage/getClient"

export default async function() {
  globalThis.apiApp = getApiApp()
  globalThis.wsServer = getWsServer()
  globalThis.db = getDb()
  globalThis.sql = sql
  globalThis.redisClient = getClient()
  return
}
