import React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import colors from '../theme/colors'
import CustomStatusBar from './common/CustomStatusBar'
import Confirmation from './Confirmation'
import Frame from './Frame'
import MainView from './MainView'
import SideBar from './SideBar'

const MarkdownEditor = () => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = React.useState(true)

  const handleDelete = () => {
    setShowDeleteConfirmation(false)
    console.log('delete')
  }

  return (
    <SafeAreaProvider>
      <CustomStatusBar backgroundColor={colors[900]} barStyle='light-content' />
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
    </SafeAreaProvider>
  )
}

export default MarkdownEditor