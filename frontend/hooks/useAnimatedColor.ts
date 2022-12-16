import React from "react"
import { Animated, ColorValue } from "react-native"

/**
 * @param offColorRGB @type {ColorValue} 'rgb(r, g, b)' type value only
 * @param onColorRGB @type {ColorValue} 'rgb(r, g, b)' type value only
 */
const useAnimatedColor = (isOn: boolean, duration: number, offColorRGB: ColorValue, onColorRGB: ColorValue): Animated.AnimatedInterpolation => {
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
    outputRange:[offColorRGB as string, onColorRGB as string]
  })
  return colorInterpolation
}
export default useAnimatedColor
