export enum ConfirmationStateTypes {
  DELETE = 'delete',
  LEAVE_UNSAVED_DOCUMENT = 'leaveUnsavedDocument',
  UNSAVED_DOCUMENT_CONFLICTED = 'unsavedDocumentConflicted',
}

export const confirmationMessages: {[key in ConfirmationStateTypes]: {
  title: string, message: (titleInput: string) => string, buttonLabel: string
}} = {
  [ConfirmationStateTypes.DELETE]: {
    title: 'Delete this document?',
    message: (titleInput: string) => "Are you sure you want to delete the ‘" + titleInput + "’ document and its contents? This action cannot be reversed.",
    buttonLabel: 'Confirm & Delete',
  },
  [ConfirmationStateTypes.LEAVE_UNSAVED_DOCUMENT]: {
    title: 'Leave this document?',
    message: (titleInput: string) => "Are you sure you want to leave the unsaved ‘" + titleInput + "’ document and its contents? This action cannot be reversed.",
    buttonLabel: 'Confirm & Leave',
  },
  [ConfirmationStateTypes.UNSAVED_DOCUMENT_CONFLICTED]: {
    title: 'This document is conflicted',
    message: (titleInput: string) => "This document is conflicted with update from server and saved as new document.",
    buttonLabel: 'Confirm',
  },
}
