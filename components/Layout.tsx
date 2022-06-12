import React from 'react'
import { ConfirmationState, useInputContext } from '../contexts/inputContext'
import { deleteSelectedDocument, selectDocument } from '../store/slices/document'
import { useAppDispatch } from '../store/hooks'
import Confirmation from './Confirmation'
import Frame from './Frame'
import MainView from './MainView'
import SafeArea from './SafeArea'
import SideBar from './SideBar'

const confirmationMessages: {[key in ConfirmationState]: {
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

const Layout = () => {
  const {titleInput, confirmationState, setConfirmationState} = useInputContext()

  const dispatch = useAppDispatch()

  const handleOk = () => {
    if (confirmationState.state === ConfirmationState.DELETE) {
      dispatch(deleteSelectedDocument())
    } else if (confirmationState.state === ConfirmationState.LEAVE_UNSAVED_DOCUMENT) {
      dispatch(selectDocument(confirmationState.nextId))
    }
    setConfirmationState({state: ConfirmationState.NONE})
  }
  const handleCancel = () => {
    setConfirmationState({state: ConfirmationState.NONE})
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