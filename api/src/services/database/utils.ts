import { Document, DocumentFromDB } from "../../models/document"

export function fromISOStringToDatetimeString(isoString: string): string {
  return isoString.slice(0, -5).replace('T', ' ')
}

export function normalizeDocument(document: DocumentFromDB): Document {
  return {
    id: document.id,
    name: document.name,
    content: document.content,
    createdAt: fromUnixTimestampToISOString(document.created_at),
    updatedAt: fromUnixTimestampToISOString(document.updated_at),
    savedOnDBAt: fromUnixTimestampToISOString(document.saved_on_db_at),
    isDeleted: document.is_deleted === 1
  }
}

export function fromUnixTimestampToISOString(timestamp: number): string {
  return new Date(timestamp * 1000).toISOString()
}

export function trimMilliseconds(isoString: string): string {
  return isoString.replace(/\.\d{3}Z$/, '.000Z')
}
