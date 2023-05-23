import type { Express } from 'express'
import type { ConnectionPool } from '@databases/mysql'
import type { SQL } from '@databases/sql'
import type { Server } from 'socket.io'
import type getClient from '../../src/services/sessionStorage/getClient'

declare global {
  var apiApp: Express | undefined
  var wsServer: Server | undefined
  var db: ConnectionPool | undefined
  /** When sharing connection pool above, sql also needs to be shared by unknown reason otherwise db.query function doesn't accept query built by sql function. */
  var sql: SQL | undefined
  var redisClient: ReturnType<typeof getClient>['client'] | undefined
}

export {}