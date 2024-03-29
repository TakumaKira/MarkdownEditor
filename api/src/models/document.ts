/** If id is matched but user_id and/or created_at is different, then id should be changed to new one. */
export type DocumentFromDB = {
  /** Never changed. */
  id: string
  /** Never changed. */
  user_id: number
  /** This is null only when deleted. */
  name: string | null
  /** This is null only when deleted. */
  content: string | null
  /** unix timestamp / Never changed. */
  created_at: number
  /** unix timestamp */
  updated_at: number
  /** unix timestamp */
  saved_on_db_at: number
  is_deleted: 0 | 1
}
type DocumentBase = {
  id: string
  /** This is null only when deleted. */
  name: string | null
  /** This is null only when deleted. */
  content: string | null
  /** 2000-01-01T00:00:00.000Z */
  createdAt: string
  /** 2000-01-01T00:00:00.000Z */
  updatedAt: string
  isDeleted: boolean
}
export type Document = DocumentBase & {
  /** 2000-01-01T00:00:00.000Z */
  savedOnDBAt: string
}
export type DocumentFromDevice = DocumentBase & {
  /** 2000-01-01T00:00:00.000Z */
  savedOnDBAt: string | null
}
export type DocumentsUpdateRequest = {
  updates: DocumentFromDevice[]
}
export type DocumentsUpdateResponse = {
  allDocuments: Document[]
  updatedIdsAsUnavailable: {from: string, to: string}[]
  duplicatedIdsAsConflicted: {original: string, duplicated: string}[]
  /** 2000-01-01T00:00:00.000Z */
  savedOnDBAt: string
}
export type DocumentUpdatedWsMessage = {
  /** 2000-01-01T00:00:00.000Z */
  savedOnDBAt: string
}
