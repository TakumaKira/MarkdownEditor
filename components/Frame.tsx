import React from 'react'
import { Animated, StyleSheet, useWindowDimensions, View } from 'react-native'
import MainView from './MainView'
import SideBar, { SIDEBAR_WIDTH } from './SideBar'

const ANIM_DURATION = 500

const Frame = (props: {sidebar: typeof SideBar, main: typeof MainView}) => {
  const {
    sidebar, main
  } = props
  const [showSidebar, setShowSidebar] = React.useState(false)
  const windowWidth = useWindowDimensions().width
  const containerWidthAnim = React.useRef(new Animated.Value(windowWidth)).current
  const sidebarWidthAnim = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    showSidebar ? showAnim() : hideAnim()
  }, [showSidebar])

  const showAnim = () => {
    Animated.timing(sidebarWidthAnim, {
      toValue: SIDEBAR_WIDTH,
      duration: ANIM_DURATION,
      useNativeDriver: false
    }).start()
    Animated.timing(containerWidthAnim, {
      toValue: windowWidth + SIDEBAR_WIDTH,
      duration: ANIM_DURATION,
      useNativeDriver: false
    }).start()
  }
  const hideAnim = () => {
    Animated.timing(sidebarWidthAnim, {
      toValue: 0,
      duration: ANIM_DURATION,
      useNativeDriver: false
    }).start()
    Animated.timing(containerWidthAnim, {
      toValue: windowWidth,
      duration: ANIM_DURATION,
      useNativeDriver: false
    }).start()
  }

  React.useEffect(() => {
    Animated.timing(sidebarWidthAnim, {
      toValue: showSidebar ? SIDEBAR_WIDTH : 0,
      duration: 0,
      useNativeDriver: false
    }).start()
    Animated.timing(containerWidthAnim, {
      toValue: showSidebar ? windowWidth + SIDEBAR_WIDTH : windowWidth,
      duration: 0,
      useNativeDriver: false
    }).start()
  }, [windowWidth])

  return (
    <Animated.View style={[styles.container, {width: containerWidthAnim}]}>
      <Animated.View style={[styles.sidebarContainer, {width: sidebarWidthAnim}]}>
        {sidebar()}
      </Animated.View>
      <View style={styles.mainContainer}>
        {main({setShowSidebar, showSidebar})}
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  sidebarContainer: {
    overflow: 'hidden',
    alignItems: 'flex-end',
  },
  mainContainer: {
    flex: 1,
  },
})

export default Frame
