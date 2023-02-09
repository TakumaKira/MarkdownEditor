import { Router } from 'express'
import { DOCUMENT_UPDATED_WS_EVENT } from '../constants'
import { apiAuthMiddleware } from '../middlewares/auth'
import { documentsRequestValidatorMiddleware } from '../middlewares/validator'
import { DocumentsUpdateResponse, Document } from '../models/document'
import { getDocuments, getNewSafeId, getUserDocuments, normalizeDocument, updateDocuments } from '../services/database'
import wsServer from '../servers/wsServer'

const documentsRouter = Router()

documentsRouter.post('/', apiAuthMiddleware, documentsRequestValidatorMiddleware, async (req, res, next) => {
  try {
    const { documentsRequest } = req
    const updatesFromDevice = documentsRequest.updates

    /**
     * Reflect every update from device to database.
     * If any error happens, revert every change.
     * If every update reflected without error, return every document of the user.
     */

    // Get every document by id of updated from device.
    const documentsOnDBToBeUpdated = await getDocuments(updatesFromDevice.map(({id}) => id))

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
        documentFromDB.user_id === req.user.id
        && documentFromDB.created_at.toISOString() === updateFromDevice.createdAt
        && documentFromDB.saved_on_db_at.toISOString() !== updateFromDevice.savedOnDBAt
      )) {
        const updateToDB: Document = {
          ...updateFromDevice,
          id: await getNewSafeId(),
          name: `[Conflicted]: ${updateFromDevice.name}`,
          updatedAt: savedOnDBAt,
          savedOnDBAt
        }
        updatesToDB.push(updateToDB)
        duplicatedIdsAsConflicted.push({original: updateFromDevice.id, duplicated: updateToDB.id})
      // If a document is needed the id to be changed, find new id and assign it as new id(this operation looks fairly costly, but this won't happen so many times so just leave log), then push it to update list.
      } else if (documentFromDB && (
        documentFromDB.user_id !== req.user.id
        || (
          documentFromDB.user_id === req.user.id
          && documentFromDB.created_at.toISOString() !== updateFromDevice.createdAt
        )
      )) {
        const updateToDB: Document = {
          ...updateFromDevice,
          id: await getNewSafeId(),
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

    await updateDocuments(updatesToDB, req.user.id)
    // If the transaction was unsuccessful, above will throw and errorMiddleware will handled it.

    // If the transaction was successful, get every document of the user and return it and emit update event to the user to make other devices start update. No need to send updated document's id, just make them save editing document and start sync.
    const allDocumentsOnDB = await getUserDocuments(req.user.id)

    const allDocuments: Document[] = allDocumentsOnDB.map(doc => normalizeDocument(doc))

    res.send({allDocuments, updatedIdsAsUnavailable, duplicatedIdsAsConflicted, savedOnDBAt} as DocumentsUpdateResponse)

    // If there's update to database, send update notification.
    if (updatesFromDevice.length > 0) {
      // Device may ignore the notification if updatedAt has been already accepted as response.
      wsServer.to(req.user.id.toString()).emit(DOCUMENT_UPDATED_WS_EVENT, savedOnDBAt)
    }
  } catch (e) {
    next(e)
  }
})
export default documentsRouter
