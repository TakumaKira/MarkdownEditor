import type { Express } from 'express'
import type { ConnectionPool } from '@databases/mysql'
import type { SQL } from '@databases/sql'
import type { Server } from 'socket.io'
import type getClient from '../../src/services/sessionStorage/getClient'

/* These declarations make writing tests bit easier as no need to "let" each variable in each test file and therefore also no need to import types for it. */
declare global {
  /** API application to be tested */
  var apiApp: Express
  /** Method to destroy apiApp. Need to call this at the last line of afterAll callback in each file. */
  var destroyApiApp: () => Promise<void>
  /** Reference to WebSocket server working with tested API application */
  var wsServer: Server
  /** Database client for test */
  var db: ConnectionPool
  /** When sharing connection pool above, sql also needs to be shared by unknown reason otherwise db.query function doesn't accept query built by sql function. */
  var sql: SQL
  /** Redis client for test */
  var redisClient: ReturnType<typeof getClient>['client']
}

export {}