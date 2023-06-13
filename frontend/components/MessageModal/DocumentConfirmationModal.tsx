import React from 'react'
import { documentConfirmationMessages } from '../../constants/documentConfirmationMessages'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { DocumentConfirmationState, DocumentConfirmationStateWithNextId } from '../../store/models/document'
import { documentConfirmationStateChanged, selectSelectedDocumentOnEdit } from '../../store/slices/document'
import MessageModalBase from './MessageModalBase'

const DocumentConfirmationModal = ({
  confirmationState,
}: {
  confirmationState: DocumentConfirmationState | DocumentConfirmationStateWithNextId
}) => {
  const dispatch = useAppDispatch()

  const {title, getMessage, buttonLabel, getButtonAction} = documentConfirmationMessages[confirmationState.type]
  const {titleInput} = useAppSelector(selectSelectedDocumentOnEdit)
  const message = getMessage(titleInput)

  const handleConfirm = () => {
    if (getButtonAction) {
      dispatch(getButtonAction(confirmationState))
    }
    dispatch(documentConfirmationStateChanged(null))
  }
  const handleCancel = () => {
    dispatch(documentConfirmationStateChanged(null))
  }

  return (
    <MessageModalBase
      title={title}
      message={message}
      buttonLabel={buttonLabel}
      onPressButton={handleConfirm}
      onPressBackground={handleCancel}
    />
  )
}
export default DocumentConfirmationModal
