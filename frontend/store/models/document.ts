import { ConfirmationState } from "../../constants/confirmationMessages"

export interface Document {
  id: string
  name: string
  content: string
  /** 2000-01-01T00:00:00.000Z */
  createdAt: string
  /** 2000-01-01T00:00:00.000Z */
  updatedAt: string
  isDeleted: boolean
  isUploaded: boolean
}
export interface DocumentOnEdit {
  id: string | null
  titleInput: string
  mainInput: string
}
export interface DocumentState {
  documentList: Document[]
  documentOnEdit: DocumentOnEdit
  /** 2000-01-01T00:00:00.000Z / Need to ask server for documents updated after this time to download, and device should store the newest time of successfully downloaded documents as this property. */
  latestUpdatedDocumentFromDBAt: string | null
  confirmationState: ConfirmationStateProps
}
export type ConfirmationStateProps = {
  state: ConfirmationState.NONE | ConfirmationState.DELETE | ConfirmationState.UNSAVED_DOCUMENT_CONFLICTED
} | {
  state: ConfirmationState.LEAVE_UNSAVED_DOCUMENT
  nextId: string
}
