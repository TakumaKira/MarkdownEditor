import React from 'react'
import { confirmationMessages, ConfirmationStateTypes } from '../constants/confirmationMessages'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { ConfirmationStateWithNextId } from '../store/models/document'
import { confirmationStateChanged, deleteSelectedDocument, selectDocument, selectSelectedDocumentOnEdit } from '../store/slices/document'
import AuthModal from './AuthModal'
import ConfirmationModal from './ConfirmationModal'
import Frame from './Frame'
import MainView from './MainView'
import SafeArea from './SafeArea'
import SideBar from './SideBar'

const Layout = () => {
  const {titleInput} = useAppSelector(selectSelectedDocumentOnEdit)
  const authState = useAppSelector(state => state.user.authState)
  const confirmationState = useAppSelector(state => state.document.confirmationState)

  const dispatch = useAppDispatch()

  const handleOk = () => {
    if (confirmationState!.type === ConfirmationStateTypes.DELETE) {
      dispatch(deleteSelectedDocument())
    } else if (confirmationState!.type === ConfirmationStateTypes.LEAVE_UNSAVED_DOCUMENT) {
      dispatch(selectDocument((confirmationState as ConfirmationStateWithNextId).nextId))
    }
    dispatch(confirmationStateChanged(null))
  }
  const handleCancel = () => {
    dispatch(confirmationStateChanged(null))
  }

  return (
    <SafeArea>
      <Frame
        sidebar={SideBar}
        main={MainView}
      />
      {confirmationState &&
        <ConfirmationModal
          title={confirmationMessages[confirmationState.type].title}
          message={confirmationMessages[confirmationState.type].message(titleInput)}
          buttonLabel={confirmationMessages[confirmationState.type].buttonLabel}
          onPressButton={handleOk}
          onPressBackground={handleCancel}
        />
      }
      {authState &&
        <AuthModal />
      }
    </SafeArea>
  )
}

export default Layout