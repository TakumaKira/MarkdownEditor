import type { Express } from 'express'
import type { ConnectionPool } from '@databases/mysql'
import type { SQL } from '@databases/sql'
import type { Server } from 'socket.io'
import type getSessionStorageClient from '../../src/services/sessionStorage/client'

/* These declarations make writing tests bit easier as no need to "let" each variable in each test file and therefore also no need to import types for it. */
declare global {
  /** API application to be tested */
  var apiApp: Express
  /** Reference to WebSocket server working with tested API application */
  var wsServer: Server
  var closeWsServer: () => Promise<void>
  /** Database client for test */
  var dbClient: ConnectionPool
  var closeDBClient: () => Promise<void>
  /** When sharing connection pool above, sql also needs to be shared by unknown reason otherwise db.query function doesn't accept query built by sql function. */
  var sql: SQL
  /** Session storage client for test */
  var sessionStorageClient: ReturnType<typeof getSessionStorageClient>['sessionStorageClient']
  var sessionStorageClientIsReady: Promise<void>
  var closeSessionStorageClient: () => Promise<void>
}

export {}