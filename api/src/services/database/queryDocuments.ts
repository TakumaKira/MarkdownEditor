import { fromISOStringToDatetimeString, sql, SQLQuery } from "."
import { Document, DocumentFromDB } from "../../models/document"
import db from "./connector"
import { v4 as uuidv4 } from 'uuid'

export async function updateDocuments(documents: Document[], userId: number): Promise<void> {
  return db.tx(async db => {
    for (const document of documents) {
      await db.query(buildUpdateDocumentQuery(document, userId))
    }
  })
}

export async function getUserDocuments(userId: number): Promise<DocumentFromDB[]> {
  return (await db.query(getUserDocumentsQuery(userId)))[0]
}

export async function getDocuments(documentIds: string[]): Promise<DocumentFromDB[]> {
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

export async function getNewSafeId(): Promise<string> {
  const id = uuidv4()
  const result = (await db.query(buildGetDocumentQuery(id)))[0]
  if (result.length === 0) {
    return id
  }
  return getNewSafeId()
}

function getUserDocumentsQuery(userId: number): SQLQuery {
  return sql`
    CALL get_user_documents (${userId});
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
