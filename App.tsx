import Constants from 'expo-constants'
import React from 'react'
import Frame from './components/Frame'
import MainView from './components/MainView'
import SideBar from './components/SideBar'
import StorybookUI from './storybook'
import 'react-native-get-random-values'

const App = () => {
  return (
    <Frame
      sidebar={SideBar}
      main={MainView}
    />
  )
}

export default Constants.manifest?.extra?.loadStorybook ? StorybookUI : App
