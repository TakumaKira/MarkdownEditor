import { ConfirmationState } from "../contexts/inputContext"

export const confirmationMessages: {[key in ConfirmationState]: {
  title: string, message: (titleInput: string) => string, buttonLabel: string
}} = {
  [ConfirmationState.NONE]: {
    title: '',
    message: (titleInput: string) => '',
    buttonLabel: '',
  },
  [ConfirmationState.DELETE]: {
    title: 'Delete this document?',
    message: (titleInput: string) => "Are you sure you want to delete the ‘" + titleInput + "’ document and its contents? This action cannot be reversed.",
    buttonLabel: 'Confirm & Delete',
  },
  [ConfirmationState.LEAVE_UNSAVED_DOCUMENT]: {
    title: 'Leave this document?',
    message: (titleInput: string) => "Are you sure you want to leave the unsaved ‘" + titleInput + "’ document and its contents? This action cannot be reversed.",
    buttonLabel: 'Confirm & Leave',
  },
}
