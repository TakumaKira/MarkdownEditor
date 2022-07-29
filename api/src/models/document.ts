export type DocumentFromDB = {
  id: string
  user_id: number
  name: string
  content: string
  /** 2000-01-01T00:00:00.000Z */
  created_at: Date
  /** 2000-01-01T00:00:00.000Z */
  updated_at: Date
  is_deleted: 0 | 1
}
export type Document = {
  id: string
  name: string
  content: string
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
