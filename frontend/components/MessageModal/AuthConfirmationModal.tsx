import React from 'react'
import { useAppDispatch } from '../../store/hooks'
import MessageModalBase from './MessageModalBase'
import { AuthConfirmationState } from '../../store/models/user'
import authConfirmationMessages from '../../constants/authConfirmationMessages'
import { authConfirmationStateChanged } from '../../store/slices/user'

const AuthConfirmationModal = ({
  confirmationState,
}: {
  confirmationState: AuthConfirmationState
}) => {
  const dispatch = useAppDispatch()

  const {title, getMessage, buttonLabel} = authConfirmationMessages[confirmationState.type]
  const message = getMessage(confirmationState)

  const handleConfirm = () => {
    dispatch(authConfirmationStateChanged(null))
  }
  const handleCancel = () => {
    dispatch(authConfirmationStateChanged(null))
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
export default AuthConfirmationModal
