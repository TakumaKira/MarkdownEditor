import { Document } from '@api/document'
import { ConfirmationStateTypes } from "../../constants/confirmationMessages"

export interface DocumentOnDevice extends Document {
  isUploaded: boolean
}
export interface DocumentOnEdit {
  id: string | null
  titleInput: string
  mainInput: string
}
export interface DocumentOnEditRestore {
  id: string | null
}
export type ConfirmationState = {
  type: ConfirmationStateTypes.DELETE | ConfirmationStateTypes.UNSAVED_DOCUMENT_CONFLICTED
}
export interface ConfirmationStateWithNextId {
  type: ConfirmationStateTypes.LEAVE_UNSAVED_DOCUMENT
  nextId: string
}
export interface DocumentState {
  documentList: DocumentOnDevice[]
  documentOnEdit: DocumentOnEdit
  /** 2000-01-01T00:00:00.000Z / Need to ask server for documents updated after this time to download, and device should store the newest time of successfully downloaded documents as this property. */
  latestUpdatedDocumentFromDBAt: string | null
  confirmationState: null | ConfirmationState | ConfirmationStateWithNextId
  restoreIsDone: boolean
}
export interface DocumentStateRestore {
  documentList: DocumentOnDevice[]
  documentOnEdit: DocumentOnEditRestore
  /** 2000-01-01T00:00:00.000Z / Need to ask server for documents updated after this time to download, and device should store the newest time of successfully downloaded documents as this property. */
  latestUpdatedDocumentFromDBAt: string | null
}
