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
  isDeleted: boolean
}
export type DocumentsRequest = {
  updated: Document[]
  /** 2000-01-01T00:00:00.000Z / Need to ask server for documents updated after this time to download, and device should store the newest time of successfully downloaded documents as this property. */
  latestUpdatedDocumentFromDBAt: string | null
}
export type DocumentsUploadResponse = {
  fromDB: Document[]
  uploadedDocumentsId: string[]
}
