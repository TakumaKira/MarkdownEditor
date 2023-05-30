import { Router } from 'express'
import { DOCUMENT_UPDATED_WS_EVENT, WS_HANDSHAKE_TOKEN_KEY } from '../constants'
import { getApiAuthMiddleware } from '../middlewares/auth'
import { documentsRequestValidatorMiddleware } from '../middlewares/validator'
import { DocumentsUpdateResponse, Document, DocumentUpdatedWsMessage } from '../models/document'
import { fromUnixTimestampToISOString, normalizeDocument, trimMilliseconds } from '../services/database/utils'
import { regenerateSession } from '../services/sessionStorage/utils'
import { Server } from 'socket.io'
import DatabaseController from '../services/database/controller'
import { SessionStorageClient } from '../services/sessionStorage/type'
import SessionStorageController from '../services/sessionStorage/controller'

export default (wsServer: Server, db: DatabaseController, sessionStorageClient: SessionStorageClient, sessionStorageClientIsReady: Promise<void>) => {
  const documentsRouter = Router()

  const apiAuthMiddleware = getApiAuthMiddleware()

  const sessionStorage = new SessionStorageController(sessionStorageClient, sessionStorageClientIsReady)

  documentsRouter.post('/', apiAuthMiddleware, documentsRequestValidatorMiddleware, async (req, res, next) => {
    try {
      if (!req.session.userId) {
        throw new Error('Session does not have userId')
      }

      const { documentsRequest } = req
      const updatesFromDevice = documentsRequest.updates

      /**
       * Reflect every update from device to database.
       * If any error happens, revert every change.
       * If every update reflected without error, return every document of the user.
       */

      // Get every document by id of updated from device.
      const documentsOnDBToBeUpdated = await db.getDocuments(updatesFromDevice.map(({id}) => id))

      /**
       * Get now here and store it as saved_on_db_at.
       * If stored saved_on_db_at is different,
       * it means the one from database has been updated from other device but device sent update based on older saved_on_db version,
       * so the conflict should be resolved.
       */

      /** The time at which sent updates are reflected to database. 2000-01-01T00:00:00.000Z */
      const savedOnDBAt = new Date().toISOString()

      const updatedIdsAsUnavailable: DocumentsUpdateResponse['updatedIdsAsUnavailable'] = []
      const duplicatedIdsAsConflicted: DocumentsUpdateResponse['duplicatedIdsAsConflicted'] = []

      // Check if these documents are ok to be inserted or updated, needed to be resolved conflict, or needed the id to be changed.
      const updatesToDB: Document[] = []
      for (const updateFromDevice of updatesFromDevice) {
        const documentFromDB = documentsOnDBToBeUpdated.find(({id}) => id === updateFromDevice.id)

        /**
         * id, user_id and created_at should be matched, otherwise new one should be given other id.
         */

        // If a document is needed to be resolve conflict, resolve and push it to update list.
        if (documentFromDB && (
          // userId did match
          documentFromDB.user_id === Number(req.session.userId)
          // createAt did match
          && fromUnixTimestampToISOString(documentFromDB.created_at) === trimMilliseconds(updateFromDevice.createdAt)
          // savedOnDBAt did not match
          && (
            updateFromDevice.savedOnDBAt !== null // This should always be true if this is actually the conflict case.
            && fromUnixTimestampToISOString(documentFromDB.saved_on_db_at) !== trimMilliseconds(updateFromDevice.savedOnDBAt) // If these two matched, it means updateFromDevice can be safely updated to database.
          )
        )) {
          // duplicate conflicted one as new document
          const updateToDB: Document = {
            ...updateFromDevice,
            id: await db.getNewSafeId(),
            name: `[Conflicted]: ${updateFromDevice.name}`,
            updatedAt: savedOnDBAt,
            savedOnDBAt
          }
          updatesToDB.push(updateToDB)
          duplicatedIdsAsConflicted.push({original: updateFromDevice.id, duplicated: updateToDB.id})
        // If a document is needed the id to be changed, find new id and assign it as new id(this operation looks fairly costly, but this won't happen so many times so just leave log), then push it to update list.
        } else if (documentFromDB && (
          // userId did not match
          documentFromDB.user_id !== Number(req.session.userId)
          // userId did match and createdAt did not match
          || (
            documentFromDB.user_id === Number(req.session.userId)
            && fromUnixTimestampToISOString(documentFromDB.created_at) !== trimMilliseconds(updateFromDevice.createdAt)
          )
          // userId did match and createdAt did match aånd one from device did not have savedOnDBAt
          || (
            // Notice this is really close case to the conflict case above.
            documentFromDB.user_id === Number(req.session.userId)
            && fromUnixTimestampToISOString(documentFromDB.created_at) === trimMilliseconds(updateFromDevice.createdAt)
            && updateFromDevice.savedOnDBAt === null // documentFromDB.saved_on_db_at is always not null
          )
        )) {
          // Change id to new one
          const updateToDB: Document = {
            ...updateFromDevice,
            id: await db.getNewSafeId(),
            savedOnDBAt
          }
          updatesToDB.push(updateToDB)
          updatedIdsAsUnavailable.push({from: updateFromDevice.id, to: updateToDB.id})
        // If a document is ok to be inserted or updated, just push it to update list.
        } else {
          // updateFromDevice.id is safe anyway here.
          const updateToDB: Document = {
            ...updateFromDevice,
            savedOnDBAt
          }
          updatesToDB.push(updateToDB)
        }
      }

      // Now all of updateFromDevice should be safe to update to database.

      await db.updateDocuments(updatesToDB, Number(req.session.userId))
      // If the transaction was unsuccessful, above will throw and errorMiddleware will handled it.

      // If the transaction was successful, get every document of the user and return it and emit update event to the user to make other devices start update. No need to send updated document's id, just make them save editing document and start sync.
      const allDocumentsOnDB = await db.getUserDocuments(Number(req.session.userId))

      const allDocuments: Document[] = allDocumentsOnDB.map(doc => normalizeDocument(doc))

      await regenerateSession(req, sessionStorage, wsServer)

      res
        .header(WS_HANDSHAKE_TOKEN_KEY, req.session.wsHandshakeToken)
        .send({allDocuments, updatedIdsAsUnavailable, duplicatedIdsAsConflicted, savedOnDBAt} as DocumentsUpdateResponse)

      // If there's update to database, send update notification.
      if (updatesFromDevice.length > 0) {
        // Device may ignore the notification if updatedAt has been already accepted as response.
        wsServer.to(req.session.userId).emit(DOCUMENT_UPDATED_WS_EVENT, {savedOnDBAt} as DocumentUpdatedWsMessage)
      }
    } catch (e) {
      next(e)
    }
  })
  return documentsRouter
}
