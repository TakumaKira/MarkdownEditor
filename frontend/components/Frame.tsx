import React from 'react';
import { Animated, StatusBar, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useWindowDimensions from '../hooks/useWindowDimensions';
import MainView from './MainView';
import SideBar, { SIDEBAR_WIDTH } from './SideBar';

const SIDE_MENU_ANIM_DURATION = 500

const Frame = (props: {sidebar: typeof SideBar, main: typeof MainView}) => {
  const {
    sidebar, main
  } = props
  const [showSidebar, setShowSidebar] = React.useState(false)
  const {width: windowWidth, height: windowHeight} = useWindowDimensions()
  const sidebarWidthAnim = React.useRef(new Animated.Value(0)).current
  const {top: iosStatusbarHeight} = useSafeAreaInsets()
  const androidStatusbarHeight = StatusBar.currentHeight ?? 0

  React.useEffect(() => {
    showSidebar ? showAnim() : hideAnim()
  }, [showSidebar])

  const showAnim = () => {
    Animated.timing(sidebarWidthAnim, {
      toValue: SIDEBAR_WIDTH,
      duration: SIDE_MENU_ANIM_DURATION,
      useNativeDriver: false
    }).start()
  }
  const hideAnim = () => {
    Animated.timing(sidebarWidthAnim, {
      toValue: 0,
      duration: SIDE_MENU_ANIM_DURATION,
      useNativeDriver: false
    }).start()
  }

  React.useEffect(() => {
    Animated.timing(sidebarWidthAnim, {
      toValue: showSidebar ? SIDEBAR_WIDTH : 0,
      duration: 0,
      useNativeDriver: false
    }).start()
  }, [windowWidth])

  return (
    <View style={[styles.container, {height: windowHeight - iosStatusbarHeight - androidStatusbarHeight}]}>
      <Animated.View style={[styles.sidebarContainer, {width: sidebarWidthAnim}]}>
        {sidebar()}
      </Animated.View>
      <View style={[styles.mainContainer, {width: windowWidth}]}>
        {main({setShowSidebar, showSidebar})}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    flexDirection: 'row',
  },
  sidebarContainer: {
    overflow: 'hidden',
    alignItems: 'flex-end',
  },
  mainContainer: {
    flexGrow: 1,
    flexShrink: 0,
  },
})

export default Frame
