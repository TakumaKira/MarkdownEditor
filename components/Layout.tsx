import React from 'react'
import Confirmation from './Confirmation'
import Frame from './Frame'
import MainView from './MainView'
import SafeArea from './SafeArea'
import SideBar from './SideBar'

const Layout = () => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = React.useState(true)

  const handleDelete = () => {
    setShowDeleteConfirmation(false)
    console.log('delete')
  }

  return (
    <SafeArea>
      <Frame
        sidebar={SideBar}
        main={MainView}
      />
      {showDeleteConfirmation && <Confirmation
        title="Delete this document?"
        message="Are you sure you want to delete the ‘welcome.md’ document and its contents? This action cannot be reversed."
        buttonLabel="Confirm & Delete"
        onPressButton={handleDelete}
        onPressBackground={() => setShowDeleteConfirmation(false)}
      />}
    </SafeArea>
  )
}

export default Layout