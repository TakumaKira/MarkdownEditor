import SessionStorageController from './controller'
import { SessionStorageClient } from './type'
import { getRedisKeyName, regenerateSession, destroySession } from './utils'

export default (sessionStorageClient: SessionStorageClient, sessionStorageClientIsReady: Promise<void>) => new SessionStorageController(sessionStorageClient, sessionStorageClientIsReady)

export {
  getRedisKeyName,
  regenerateSession,
  destroySession,
}
