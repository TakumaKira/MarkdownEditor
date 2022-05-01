import React, { Dispatch, SetStateAction } from 'react'
import { StyleSheet, View } from 'react-native'
import EditorViewFrame from './EditorViewFrame'
import TopBar from './TopBar'

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

const MainView = (props: {setShowSidebar: Dispatch<SetStateAction<boolean>>}) => {
  const {
    setShowSidebar,
  } = props

  return (
    <View style={styles.container}>
      <TopBar setShowSidebar={setShowSidebar} />
      <EditorViewFrame />
    </View>
  )
}

export default MainView
