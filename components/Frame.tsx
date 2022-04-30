import React, { Dispatch, SetStateAction } from 'react'
import { Animated, StyleSheet, View } from 'react-native'

const SIDEBAR_WIDTH = 250
const ANIM_DURATION = 1000

const Frame = (props: {sidebar: () => JSX.Element, main: (setShowSidebar: Dispatch<SetStateAction<boolean>>) => JSX.Element}) => {
  const {
    sidebar, main
  } = props
  const [showSidebar, setShowSidebar] = React.useState(false)
  const widthAnim = React.useRef(new Animated.Value(0)).current

  const showAnim = () => {
    Animated.timing(widthAnim, {
      toValue: SIDEBAR_WIDTH,
      duration: ANIM_DURATION,
      useNativeDriver: true
    }).start()
  }
  const hideAnim = () => {
    Animated.timing(widthAnim, {
      toValue: 0,
      duration: ANIM_DURATION,
      useNativeDriver: true
    }).start()
  }

  React.useEffect(() => {
    showSidebar ? showAnim() : hideAnim()
  }, [showSidebar])

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.sidebarContainer, {width: widthAnim}]}>
        {sidebar()}
      </Animated.View>
      <View style={styles.mainContainer}>
        {main(setShowSidebar)}
      </View>
    </View>
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
  },
  mainContainer: {
    flex: 1,
    height: '100%',
  },
})

export default Frame
