import { DocumentFromDevice as DocumentToApi } from '@api/document'
import { DocumentConfirmationStateTypes } from "../../constants/documentConfirmationMessages"

export interface DocumentOnDevice extends DocumentToApi {
  isUploaded: boolean
}
export interface DocumentOnEdit {
  id: string | null
  titleInput: string
  mainInput: string
}
export interface DocumentOnEditOnAsyncStorage {
  id: string | null
}
export type DocumentConfirmationState = {
  type: DocumentConfirmationStateTypes.DELETE | DocumentConfirmationStateTypes.UNSAVED_DOCUMENT_CONFLICTED
}
export interface DocumentConfirmationStateWithNextId {
  type: DocumentConfirmationStateTypes.LEAVE_UNSAVED_DOCUMENT
  nextId: string
}
interface DocumentStateBase {
  documentList: DocumentOnDevice[]
  /** This is used to avoid extra sync by comparing this with `DocumentUpdatedWsMessage.savedOnDBAt`. 2000-01-01T00:00:00.000Z */
  lastSyncWithDBAt: string | null
}
export interface DocumentState extends DocumentStateBase {
  documentOnEdit: DocumentOnEdit
  confirmationState: null | DocumentConfirmationState | DocumentConfirmationStateWithNextId
  restoreFromAsyncStorageIsDone: boolean
  isAskingUpdate: boolean
}
export interface DocumentStateOnAsyncStorage extends DocumentStateBase {
  documentOnEdit: DocumentOnEditOnAsyncStorage
}
