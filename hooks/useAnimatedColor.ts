import React from "react"
import { Animated } from "react-native"

const useAnimatedColor = (isOn: boolean, duration: number, offColorRGB: string, onColorRGB: string) => {
  const [colorAnimation] = React.useState(new Animated.Value(0))
  React.useEffect(() => {
    if (isOn) {
      Animated.timing(colorAnimation, {
        toValue: 1,
        duration,
        useNativeDriver: false
      }).start()
    } else {
      Animated.timing(colorAnimation, {
        toValue: 0,
        duration,
        useNativeDriver: false
      }).start()
    }
  }, [isOn])
  const colorInterpolation = colorAnimation.interpolate({
    inputRange: [0, 1],
    outputRange:[offColorRGB , onColorRGB]
  })
  return colorInterpolation
}
export default useAnimatedColor