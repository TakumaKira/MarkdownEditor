import React from 'react'
import { useInputContext } from '../contexts/inputContext'
import { deleteSelectedDocument } from '../store/document'
import { useAppDispatch } from '../store/hooks'
import Confirmation from './Confirmation'
import Frame from './Frame'
import MainView from './MainView'
import SafeArea from './SafeArea'
import SideBar from './SideBar'

const Layout = () => {
  const {titleInput, showDeleteConfirmation, setShowDeleteConfirmation} = useInputContext()

  const dispatch = useAppDispatch()

  const handleDelete = () => {
    dispatch(deleteSelectedDocument())
    setShowDeleteConfirmation(false)
  }

  return (
    <SafeArea>
      <Frame
        sidebar={SideBar}
        main={MainView}
      />
      {showDeleteConfirmation && <Confirmation
        title="Delete this document?"
        message={"Are you sure you want to delete the ‘" + titleInput + "’ document and its contents? This action cannot be reversed."}
        buttonLabel="Confirm & Delete"
        onPressButton={handleDelete}
        onPressBackground={() => setShowDeleteConfirmation(false)}
      />}
    </SafeArea>
  )
}

export default Layout