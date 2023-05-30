import { _getDocuments, _getNewSafeId, _getUserDocuments, _updateDocuments } from './controller/queryDocuments'
import { fromISOStringToDatetimeString, normalizeDocument } from './utils'
import DatabaseController from './controller'
import { DatabaseClient } from './types'

export default (dbClient: DatabaseClient) => new DatabaseController(dbClient)

export {
  fromISOStringToDatetimeString,
  normalizeDocument,
}
