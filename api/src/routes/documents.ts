import { Router } from 'express'
import { RowDataPacket } from 'mysql2/promise'
import { v4 as uuidv4 } from 'uuid'
import { DOCUMENT_UPDATED_WS_EVENT } from '../constants'
import getConnection from '../db/getConnection'
import { apiAuthMiddleware } from '../middlewares/auth'
import { documentsRequestValidatorMiddleware } from '../middlewares/validator'
import { Document, DocumentFromDB, DocumentsUpdateResponse } from '../models/document'
import { wsServer } from '../servers/api'

const documentsRouter = Router()

documentsRouter.post('/', apiAuthMiddleware, documentsRequestValidatorMiddleware, async (req, res) => {
  try {
    const { documentsRequest } = req

    const updateFromDevice = documentsRequest.updates

    const connection = await getConnection()
    let after: string | null = documentsRequest.requestUpdatesOnDBAfter ? fromISOStringToTimeStamp(documentsRequest.requestUpdatesOnDBAfter) : null
    after = after ? `"${after}"` : null
    const [rows, fields] = await connection.execute<RowDataPacket[][]>(`
      CALL get_documents('${req.user.id}', ${after ?? 'NULL'});
    `)
    const updateFromDatabase = (rows[0] as DocumentFromDB[]).map(fromDB => normalize(fromDB))

    /**
     * Reflect every update from device to database.
     * If any error happens, revert every change.
     * TODO: Use transaction feature to avoid partial update?
     * If every update reflected without error, return every document of the user.
     */

    /**
     * id, user_id and created_at should be matched, otherwise new one should be given other id.
     */

    /**
     * Get now here and use it as saved_on_db_at.
     * If saved_on_db_at is different,
     * it means the one from database has been updated from other device,
     * but device sent update based on older saved_on_db version,
     * so the conflict should be resolved.
     */

    // Get every document by id of updated from device.
    // Prepare and test query builder to select multiple documents by id.

    // Check if these documents are ok to be inserted or updated, needed to be resolved conflict, or needed the id to be changed.
    // If a document is ok to be inserted or updated, just push it to update list.

    // If a document is needed to be resolve conflict, resolve and push it to update list.

    // If a document is needed the id to be changed, find new id and assign it as new id(this operation looks fairly costly, but this won't happen so many times so just leave log), then push it to update list.

    // Build SQL to update entire the list as a transaction.
    // Prepare and test query builder to update multiple documents as a transaction.

    // If the transaction was successful, get every document of the user and return it and emit update event to the user to make other devices start update. No need to send updated document's id, just make them save editing document and start sync.

    // If the transaction was unsuccessful, return unhandled error.

    const updateToDevice: Document[] = []
    const updateToDatabase: Document[] = []

    // Update newer document of conflicted documents with new id and name, and push to send-back que
    const conflictedDocumentsId: string[] = []
    for (const fromDevice of updateFromDevice) {
      for (const fromDatabase of updateFromDatabase) {
        if (fromDevice.id === fromDatabase.id) {
          if (fromDevice.createdAt === fromDatabase.createdAt) {
            fromDevice.id = uuidv4()
            fromDevice.name = `[Conflicted]: ${fromDevice.name}`
            fromDevice.updatedAt = new Date().toISOString()
            updateToDevice.push(fromDevice)
            conflictedDocumentsId.push(fromDevice.id)
          } else {
            // TODO: Give new id?
          }
          break // OK to break this loop for updateFromDatabase because other fromDatabase.id cannot be matched with this fromDevice.id.
        }
      }
    }

    // Push every document to send pool for counterpart.
    updateToDevice.push(...updateFromDatabase)
    updateToDatabase.push(...updateFromDevice)

    const uploadedDocumentsIdWithoutConflict: string[] = []

    // Push to server.
    const dbUpdatedDocumentIds: string[] = []
    for (const toDatabase of updateToDatabase) {
      const query = buildUpdateDocumentQuery(toDatabase, req.user.id)
      // TODO: Test that every document except the one causing an error will be updated.
      try {
        await connection.execute<RowDataPacket[][]>(query)
        dbUpdatedDocumentIds.push(toDatabase.id)
        if (!conflictedDocumentsId.includes(toDatabase.id)) {
          uploadedDocumentsIdWithoutConflict.push(toDatabase.id)
        }
      } catch (err) {
        console.error(err)
        // TODO: Give new id if "Another user's document is using the same id." error returned.
        console.error('The query might cause the error.', query)
      }
    }

    // Push to device.
    const documentsUploadResponse: DocumentsUpdateResponse = {
      updateResults: updateToDevice
      // updatesFromDB: updateToDevice,
      // updateSuccessIds: uploadedDocumentsIdWithoutConflict
    }
    res.send(documentsUploadResponse)

    // If any error occurs, update time would not be updated, so it will be updated next time.

    // If there's update to database, send update notification.
    if (dbUpdatedDocumentIds.length > 0) {
      wsServer.to(req.user.id.toString()).emit(DOCUMENT_UPDATED_WS_EVENT, dbUpdatedDocumentIds)
    }
  } catch (error) {
    console.error(error)
    res.status(500).send('Something went wrong.')
  }
})

export default documentsRouter

export function fromISOStringToTimeStamp(isoString: string): string {
  return isoString.slice(0, -5).replace('T', ' ')
}

function escapeSingleQuote(string: string): string {
  // TODO: Test succeeding single quotes cases
  return string.replace(/\'/g, '\'\'')
}

export function normalize(document: DocumentFromDB): Document {
  return {
    id: document.id,
    name: document.name,
    content: document.content,
    createdAt: document.created_at.toISOString(),
    updatedAt: document.updated_at.toISOString(),
    isDeleted: document.is_deleted === 1
  }
}

/** TODO: Make name and content encrypted with user's password? */
function buildUpdateDocumentQuery(document: Document, userId: number) {
  return `
    CALL update_document (
      '${document.id}',
      ${userId},
      ${document.name !== null ? `'${document.name}'` : `NULL`},
      ${document.content !== null ? `'${escapeSingleQuote(document.content)}'` : `NULL`},
      '${fromISOStringToTimeStamp(document.createdAt)}',
      '${fromISOStringToTimeStamp(document.updatedAt)}',
      ${document.isDeleted}
    );
  `
}
