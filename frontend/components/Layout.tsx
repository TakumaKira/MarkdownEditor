import React from 'react'
import { confirmationMessages, ConfirmationState } from '../constants/confirmationMessages'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { confirmationStateChanged, deleteSelectedDocument, selectDocument, selectSelectedDocumentOnEdit } from '../store/slices/document'
import Confirmation from './Confirmation'
import Frame from './Frame'
import MainView from './MainView'
import SafeArea from './SafeArea'
import SideBar from './SideBar'

const Layout = () => {
  const {titleInput} = useAppSelector(selectSelectedDocumentOnEdit)
  const confirmationState = useAppSelector(state => state.document.confirmationState)

  const dispatch = useAppDispatch()

  const handleOk = () => {
    // TODO: This should not know too much detail of confirmation state.
    if (confirmationState.state === ConfirmationState.DELETE) {
      dispatch(deleteSelectedDocument())
    } else if (confirmationState.state === ConfirmationState.LEAVE_UNSAVED_DOCUMENT) {
      dispatch(selectDocument(confirmationState.nextId))
    }
    dispatch(confirmationStateChanged({state: ConfirmationState.NONE}))
  }
  const handleCancel = () => {
    dispatch(confirmationStateChanged({state: ConfirmationState.NONE}))
  }

  return (
    <SafeArea>
      <Frame
        sidebar={SideBar}
        main={MainView}
      />
      {confirmationState.state !== ConfirmationState.NONE &&
        <Confirmation
          title={confirmationMessages[confirmationState.state].title}
          message={confirmationMessages[confirmationState.state].message(titleInput)}
          buttonLabel={confirmationMessages[confirmationState.state].buttonLabel}
          onPressButton={handleOk}
          onPressBackground={handleCancel}
        />
      }
    </SafeArea>
  )
}

export default Layout