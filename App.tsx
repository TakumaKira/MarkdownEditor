import Constants from 'expo-constants'
import React from 'react'
import { StyleSheet } from 'react-native'
import Frame from './components/Frame'
import MainView from './components/MainView'
import SideBar from './components/SideBar'
import StorybookUI from './storybook'

const App = () => {
  return (
    <Frame
      sideBar={SideBar}
      main={MainView}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default Constants.manifest?.extra?.loadStorybook ? StorybookUI : App
