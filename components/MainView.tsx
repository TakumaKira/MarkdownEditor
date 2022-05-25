import React, { Dispatch, SetStateAction } from 'react'
import { View } from 'react-native'
import EditorView from './EditorView'
import TopBar from './TopBar'

const MainView = (props: {setShowSidebar: Dispatch<SetStateAction<boolean>>, showSidebar: boolean}) => {
  const {
    setShowSidebar,
    showSidebar,
  } = props

  return (
    <View>
      <TopBar setShowSidebar={setShowSidebar} showSidebar={showSidebar} />
      <EditorView />
    </View>
  )
}

export default MainView
