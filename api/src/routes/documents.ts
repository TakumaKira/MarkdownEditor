import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { DOCUMENT_UPDATED_WS_EVENT } from '../constants'
import { apiAuthMiddleware } from '../middlewares/auth'
import { documentsRequestValidatorMiddleware } from '../middlewares/validator'
import { DocumentFromDB, DocumentsUpdateResponse, Document } from '../models/document'
import db, { ConnectionPool, sql } from '../services/database'
import { SQLQuery } from '@databases/sql'
import wsServer from '../servers/wsServer/wsServer'

const documentsRouter = Router()

documentsRouter.post('/', apiAuthMiddleware, documentsRequestValidatorMiddleware, async (req, res) => {

  const { documentsRequest } = req
  const updatesFromDevice = documentsRequest.updates

  /**
   * Reflect every update from device to database.
   * If any error happens, revert every change.
   * If every update reflected without error, return every document of the user.
   */

  // Get every document by id of updated from device.
  const documentsOnDBToBeUpdated: DocumentFromDB[] = await db.tx(async db => {
    const documents: DocumentFromDB[] = []
    for (const updateFromDevice of updatesFromDevice) {
      const foundOnDB: DocumentFromDB = (await db.query(buildGetDocumentQuery(updateFromDevice.id)))[0][0]
      if (foundOnDB) {
        documents.push(foundOnDB)
      }
    }
    return documents
  })

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

  try {
    await updateDocuments(updatesToDB, req.user.id, db)
  } catch (e) {
    // If the transaction was unsuccessful, return unhandled error.
    console.error(e)
    res.status(500).send('Something went wrong.')
  }

  // If the transaction was successful, get every document of the user and return it and emit update event to the user to make other devices start update. No need to send updated document's id, just make them save editing document and start sync.
  const allDocumentsOnDB: DocumentFromDB[] = (await db.query(sql`
    CALL get_user_documents (${req.user.id});
  `))[0]

  const allDocuments: Document[] = allDocumentsOnDB.map(doc => normalize(doc))

  res.send({allDocuments, updatedIdsAsUnavailable, duplicatedIdsAsConflicted, savedOnDBAt} as DocumentsUpdateResponse)

  // If there's update to database, send update notification.
  if (updatesFromDevice.length > 0) {
    // Device may ignore the notification if updatedAt has been already accepted as response.
    wsServer.to(req.user.id.toString()).emit(DOCUMENT_UPDATED_WS_EVENT, savedOnDBAt)
  }
})

export default documentsRouter

export function fromISOStringToTimeStamp(isoString: string): string {
  return isoString.slice(0, -5).replace('T', ' ')
}

export function normalize(document: DocumentFromDB): Document {
  return {
    id: document.id,
    name: document.name,
    content: document.content,
    createdAt: document.created_at.toISOString(),
    updatedAt: document.updated_at.toISOString(),
    savedOnDBAt: document.saved_on_db_at.toISOString(),
    isDeleted: document.is_deleted === 1
  }
}

// TODO: Change this to use transaction?
export function buildGetDocumentQuery(id: string): SQLQuery {
  return sql`
    CALL get_document (${id});
  `
}
/** TODO: Make name and content encrypted with user's password? */
function buildUpdateDocumentQuery(document: Document, userId: number): SQLQuery {
  return sql`
    CALL update_document (
      ${document.id},
      ${userId},
      ${document.name !== null ? document.name : null},
      ${document.content !== null ? document.content : null},
      ${fromISOStringToTimeStamp(document.createdAt)},
      ${fromISOStringToTimeStamp(document.updatedAt)},
      ${fromISOStringToTimeStamp(document.savedOnDBAt)},
      ${document.isDeleted}
    );
  `
}

export async function getNewSafeId(): Promise<string> {
  const id = uuidv4()
  const result = (await db.query(buildGetDocumentQuery(id)))[0]
  if (result.length === 0) {
    return id
  }
  return getNewSafeId()
}

export async function updateDocuments(documents: Document[], userId: number, db: ConnectionPool): Promise<void> {
  return db.tx(async db => {
    for (const document of documents) {
      await db.query(buildUpdateDocumentQuery(document, userId))
    }
  })
}
