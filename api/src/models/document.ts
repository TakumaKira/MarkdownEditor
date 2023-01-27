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
  /** 2000-01-01T00:00:00.000Z / Never changed. */
  created_at: Date
  /** 2000-01-01T00:00:00.000Z */
  updated_at: Date
  /** 2000-01-01T00:00:00.000Z */
  saved_on_db_at: Date
  is_deleted: 0 | 1
}
export type Document = {
  id: string
  /** This is null only when deleted. */
  name: string | null
  /** This is null only when deleted. */
  content: string | null
  /** 2000-01-01T00:00:00.000Z */
  createdAt: string
  /** 2000-01-01T00:00:00.000Z */
  updatedAt: string
  /** 2000-01-01T00:00:00.000Z */
  savedOnDBAt: string | null
  isDeleted: boolean
}
export type DocumentsUpdateRequest = {
  updates: Document[]
}
export type DocumentsUpdateResponse = {
  allDocuments: Document[]
}
