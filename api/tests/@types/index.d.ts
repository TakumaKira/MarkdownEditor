import type { Express } from 'express'
import type { ConnectionPool } from '@databases/mysql'
import type { SQL } from '@databases/sql'
import type { Server } from 'socket.io'
import type getClient from '../../src/services/sessionStorage/getClient'

declare global {
  /** API application to be tested */
  var apiApp: Express
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