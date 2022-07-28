import { Router } from 'express'
import { RowDataPacket } from 'mysql2/promise'
import { v4 as uuidv4 } from 'uuid'
import { wsServer } from '..'
import getConnection from '../db/getConnection'
import { authApi } from '../middleware/auth'
import { Document, DocumentFromDB, DocumentsRequest } from '../models/document'

const documentsRouter = Router()

documentsRouter.post('/', authApi, async (req, res) => {
  try {
    const requestBody: DocumentsRequest = req.body
    const updateFromDevice = requestBody.updated

    const connection = await getConnection()
    let after: string | null = requestBody.deviceLastSynched ? fromISOStringToTimeStamp(requestBody.deviceLastSynched) : null
    after = after ? `"${after}"` : null
    const [rows, fields] = await connection.execute<RowDataPacket[][]>(`
      CALL get_documents('${req.user.id}', ${after ?? 'NULL'});
    `)
    const updateFromDB = (rows[0] as DocumentFromDB[]).map(fromDB => normalize(fromDB))

    const toDevice: Document[] = []
    const toDB: Document[] = []

    // Find conflicted.
    updateFromDevice.forEach(fromDevice => {
      const fromDB = updateFromDB.find(({id}) => id === fromDevice.id)
      if (fromDB) {
        // Create document marked conflicted with newer contents.
        const conflicted = fromDevice.updatedAt > fromDB.updatedAt ? fromDevice : fromDB
        conflicted.id = uuidv4()
        conflicted.name = `[Conflicted]: ${conflicted.name}`
        // Push new document to send pool for server and device.
        toDevice.push(conflicted)
        toDB.push(conflicted)
      }
    })

    // Push every document to send pool for counterpart.
    toDevice.push(...updateFromDB)
    toDB.push(...updateFromDevice)

    // Push to server.
    /** TODO: Make name and content encrypted with user's password? */
    const buildQuery = (document: Document) => `
      CALL update_document (
        '${document.id}',
        ${req.user.id},
        '${document.name}',
        '${escapeSingleQuote(document.content)}',
        '${fromISOStringToTimeStamp(document.createdAt)}',
        '${fromISOStringToTimeStamp(document.updatedAt)}',
        ${document.isDeleted}
      );
    `
    for (const document of toDB) {
      const query = buildQuery(document)
      // TODO: Confirm with test that every document except the one causing an error will be updated.
      try {
        await connection.execute<RowDataPacket[][]>(query)
      } catch (err) {
        console.error(err)
        console.error('The query might cause the error.', query)
      }
    }

    // Push to device.
    res.send(toDevice)

    // If any error occurs, update time would not be updated, so it will be updated next time.

    wsServer.to(req.user.id).emit('documents_updated', requestBody.deviceLastSynched)
  } catch (error) {
    console.error(error)
    res.status(500).send('Something went wrong.')
  }
})

function fromISOStringToTimeStamp(isoString: string): string {
  return isoString.slice(0, -5).replace('T', ' ')
}

function escapeSingleQuote(string: string): string {
  // TODO: Check succeeding single quotes cases
  return string.replace(/\'/g, '\'\'')
}

function normalize(document: DocumentFromDB): Document {
  return {
    id: document.id,
    name: document.name,
    content: document.content,
    createdAt: document.created_at.toISOString(),
    updatedAt: document.updated_at.toISOString(),
    isDeleted: !!document.is_deleted
  }
}

export default documentsRouter
