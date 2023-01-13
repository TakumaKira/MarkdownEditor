import { Router } from 'express'
import { RowDataPacket } from 'mysql2/promise'
import { v4 as uuidv4 } from 'uuid'
import getConnection from '../db/getConnection'
import { authApiMiddleware } from '../middlewares/auth'
import { documentsRequestValidatorMiddleware } from '../middlewares/validator'
import { Document, DocumentFromDB, DocumentsUploadResponse } from '../models/document'
import { wsServer } from '../servers/api'

const documentsRouter = Router()

documentsRouter.post('/', authApiMiddleware, documentsRequestValidatorMiddleware, async (req, res) => {
  try {
    const { documentsRequest } = req

    const updateFromDevice = documentsRequest.updated

    const connection = await getConnection()
    let after: string | null = documentsRequest.latestUpdatedDocumentFromDBAt ? fromISOStringToTimeStamp(documentsRequest.latestUpdatedDocumentFromDBAt) : null
    after = after ? `"${after}"` : null
    const [rows, fields] = await connection.execute<RowDataPacket[][]>(`
      CALL get_documents('${req.user.id}', ${after ?? 'NULL'});
    `)
    const updateFromDatabase = (rows[0] as DocumentFromDB[]).map(fromDB => normalize(fromDB))

    const updateToDevice: Document[] = []
    const updateToDatabase: Document[] = []

    // Update newer document of conflicted documents with new id and name, and push to send-back que
    const conflictedDocumentsId: string[] = []
    for (const fromDevice of updateFromDevice) {
      for (const fromDatabase of updateFromDatabase) {
        if (fromDevice.id === fromDatabase.id) {
          fromDevice.id = uuidv4()
          fromDevice.name = `[Conflicted]: ${fromDevice.name}`
          fromDevice.updatedAt = new Date().toISOString()
          updateToDevice.push(fromDevice)
          conflictedDocumentsId.push(fromDevice.id)
          break
        }
      }
    }

    // Push every document to send pool for counterpart.
    updateToDevice.push(...updateFromDatabase)
    updateToDatabase.push(...updateFromDevice)

    const uploadedDocumentsIdWithoutConflict: string[] = []

    // Push to server.
    for (const toDatabase of updateToDatabase) {
      const query = buildUpdateDocumentQuery(toDatabase, req.user.id)
      // TODO: Test that every document except the one causing an error will be updated.
      try {
        await connection.execute<RowDataPacket[][]>(query)
        if (!conflictedDocumentsId.includes(toDatabase.id)) {
          uploadedDocumentsIdWithoutConflict.push(toDatabase.id)
        }
      } catch (err) {
        console.error(err)
        // TODO: What if "Another user's document is using the same id." error returned?
        console.error('The query might cause the error.', query)
      }
    }

    // Push to device.
    const documentsUploadResponse: DocumentsUploadResponse = {fromDB: updateToDevice, uploadedDocumentsId: uploadedDocumentsIdWithoutConflict}
    res.send(documentsUploadResponse)

    // If any error occurs, update time would not be updated, so it will be updated next time.

    // If there's no update, do not send update notification.
    if (updateToDevice.length === 0 && uploadedDocumentsIdWithoutConflict.length === 0) {
      return
    }
    // Get user's latest update time from DB.
    const [rows2, fields2] = await connection.execute<RowDataPacket[][]>(`
      CALL get_latest_update_time('${req.user.id}');
    `)
    const latestUpdatedAt = (rows2[0][0].updated_at as Date).toISOString()
    wsServer.to(req.user.id.toString()).emit('documents_updated', latestUpdatedAt)
  } catch (error) {
    console.error(error)
    res.status(500).send('Something went wrong.')
  }
})

export default documentsRouter

function fromISOStringToTimeStamp(isoString: string): string {
  return isoString.slice(0, -5).replace('T', ' ')
}

function escapeSingleQuote(string: string): string {
  // TODO: Test succeeding single quotes cases
  return string.replace(/\'/g, '\'\'')
}

function normalize(document: DocumentFromDB): Document {
  return {
    id: document.id,
    name: document.name,
    content: document.content,
    createdAt: document.created_at?.toISOString() ?? null,
    updatedAt: document.updated_at.toISOString(),
    isDeleted: !!document.is_deleted
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
      ${document.createdAt !== null ? `'${fromISOStringToTimeStamp(document.createdAt)}'` : `NULL`},
      '${fromISOStringToTimeStamp(document.updatedAt)}',
      ${document.isDeleted}
    );
  `
}
