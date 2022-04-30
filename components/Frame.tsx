import React, { Dispatch, SetStateAction } from 'react'
import { Animated, StyleSheet, View, Dimensions } from 'react-native'
import { SIDEBAR_WIDTH } from './SideBar'

const ANIM_DURATION = 500

const Frame = (props: {sideBar: () => JSX.Element, main: (props: {setShowSidebar: Dispatch<SetStateAction<boolean>>}) => JSX.Element}) => {
  const {
    sideBar: sidebar, main
  } = props
  const [showSidebar, setShowSidebar] = React.useState(false)
  const windowWidth = Dimensions.get('window').width
  const containerWidthAnim = React.useRef(new Animated.Value(windowWidth)).current
  const sidebarWidthAnim = React.useRef(new Animated.Value(0)).current

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
    showSidebar ? showAnim() : hideAnim()
  }, [showSidebar])

  return (
    <Animated.View style={[styles.container, {width: containerWidthAnim}]}>
      <Animated.View style={[styles.sidebarContainer, {width: sidebarWidthAnim}]}>
        {sidebar()}
      </Animated.View>
      <View style={styles.mainContainer}>
        {main({setShowSidebar})}
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarContainer: {
    height: '100%',
    overflow: 'hidden',
    alignItems: 'flex-end',
  },
  mainContainer: {
    flex: 1,
    height: '100%',
  },
})

export default Frame
