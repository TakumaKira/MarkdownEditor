import React from 'react'
import { confirmationMessages } from '../constants/confirmationMessages'
import { ConfirmationState, useInputContext } from '../contexts/inputContext'
import { useAppDispatch } from '../store/hooks'
import { deleteSelectedDocument, selectDocument } from '../store/slices/document'
import Confirmation from './Confirmation'
import Frame from './Frame'
import MainView from './MainView'
import SafeArea from './SafeArea'
import SideBar from './SideBar'

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