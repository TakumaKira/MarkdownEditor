import { Document, DocumentFromDB } from "../../models/document"

export function fromISOStringToTimeStamp(isoString: string): string {
  return isoString.slice(0, -5).replace('T', ' ')
}

export function normalizeDocument(document: DocumentFromDB): Document {
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
