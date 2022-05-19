import React, { Dispatch, SetStateAction } from 'react'
import { StyleSheet, View } from 'react-native'
import EditorView from './EditorView'
import TopBar from './TopBar'

const MainView = (props: {setShowSidebar: Dispatch<SetStateAction<boolean>>}) => {
  const {
    setShowSidebar,
  } = props

  return (
    <View>
      <TopBar setShowSidebar={setShowSidebar} />
      <EditorView />
    </View>
  )
}

export default MainView
