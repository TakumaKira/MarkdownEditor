import { ConnectionPool, sql, SQLQuery } from '@databases/mysql';
import { fromISOStringToDatetimeString } from "../utils"
import { Document, DocumentFromDB } from "../../../models/document"
import { v4 as uuidv4 } from 'uuid'

export function _updateDocuments(db: ConnectionPool) {
  return async function updateDocuments(documents: Document[], userId: number): Promise<void> {
    return db.tx(async _db => {
      for (const document of documents) {
        await _db.query(buildUpdateDocumentQuery(document, userId))
      }
    })
  }
}

export function _getUserDocuments(db: ConnectionPool) {
  return async function getUserDocuments(userId: number): Promise<DocumentFromDB[]> {
    return (await db.query(getUserDocumentsQuery(userId)))[0]
  }
}

export function _getDocuments(db: ConnectionPool) {
  return async function getDocuments(documentIds: string[]): Promise<DocumentFromDB[]> {
    return await db.tx(async _db => {
      const documents: DocumentFromDB[] = []
      for (const documentId of documentIds) {
        const foundOnDB = (await _db.query(buildGetDocumentQuery(documentId)))[0][0]
        if (foundOnDB) {
          documents.push(foundOnDB)
        }
      }
      return documents
    })
  }
}

export function _getNewSafeId(db: ConnectionPool) {
  return async function getNewSafeId(): Promise<string> {
  const id = uuidv4()
  const result = (await db.query(buildGetDocumentQuery(id)))[0]
  if (result.length === 0) {
    return id
  }
  return getNewSafeId()
}
}

function getUserDocumentsQuery(userId: number): SQLQuery {
  return sql`
    CALL get_user_documents (${userId});
  `
}

function buildUpdateDocumentQuery(document: Document, userId: number): SQLQuery {
  return sql`
    CALL update_document (
      ${document.id},
      ${userId},
      ${document.name !== null ? document.name : null},
      ${document.content !== null ? document.content : null},
      ${fromISOStringToDatetimeString(document.createdAt)},
      ${fromISOStringToDatetimeString(document.updatedAt)},
      ${fromISOStringToDatetimeString(document.savedOnDBAt)},
      ${document.isDeleted}
    );
  `
}

function buildGetDocumentQuery(id: string): SQLQuery {
  return sql`
    CALL get_document (${id});
  `
}
