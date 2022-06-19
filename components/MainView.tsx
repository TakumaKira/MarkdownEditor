import React, { Dispatch, SetStateAction } from 'react'
import { useWindowDimensions, View } from 'react-native'
import EditorView from './EditorView'
import TopBar, { TOP_BAR_HEIGHT } from './TopBar'

const MainView = (props: {setShowSidebar: Dispatch<SetStateAction<boolean>>, showSidebar: boolean}) => {
  const {
    setShowSidebar,
    showSidebar,
  } = props

  const {height: windowHeight} = useWindowDimensions()

  return (
    <View>
      <TopBar setShowSidebar={setShowSidebar} showSidebar={showSidebar} />
      <EditorView maxHeight={windowHeight - TOP_BAR_HEIGHT} />
    </View>
  )
}
export default MainView
