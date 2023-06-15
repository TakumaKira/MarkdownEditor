import { AnyAction } from "@reduxjs/toolkit"
import { deleteSelectedDocument, selectDocument } from "../store/slices/document"
import { DocumentConfirmationStateWithNextId, DocumentState } from "../store/models/document"
import DocumentConfirmationStateTypes from "../types/DocumentConfirmationStateTypes"

const documentConfirmationMessages: {[key in DocumentConfirmationStateTypes]: {
  title: string
  getMessage: (titleInput: string) => string
  buttonLabel: string
  getButtonAction?: (confirmationState: DocumentState['confirmationState']) => AnyAction
}} = {
  [DocumentConfirmationStateTypes.DELETE]: {
    title: 'Delete this document?',
    getMessage: (titleInput: string) => "Are you sure you want to delete the ‘" + titleInput + "’ document and its contents? This action cannot be reversed.",
    buttonLabel: 'Confirm & Delete',
    getButtonAction: (confirmationState: DocumentState['confirmationState']) => deleteSelectedDocument()
  },
  [DocumentConfirmationStateTypes.LEAVE_UNSAVED_DOCUMENT]: {
    title: 'Leave this document?',
    getMessage: (titleInput: string) => "Are you sure you want to leave the unsaved ‘" + titleInput + "’ document and its contents? This action cannot be reversed.",
    buttonLabel: 'Confirm & Leave',
    getButtonAction: (confirmationState: DocumentState['confirmationState']) => selectDocument((confirmationState as DocumentConfirmationStateWithNextId).nextId)
  },
  [DocumentConfirmationStateTypes.UNSAVED_DOCUMENT_CONFLICTED]: {
    title: 'This document is conflicted',
    getMessage: (titleInput: string) => "This document is conflicted with update from server and saved as new document.",
    buttonLabel: 'Confirm',
  },
}
export default documentConfirmationMessages
