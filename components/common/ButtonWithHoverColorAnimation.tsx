import React from "react"
import { Animated, ColorValue, StyleProp, TouchableOpacity, View, ViewStyle } from 'react-native'
import { useHover } from "react-native-web-hooks"
import useAnimatedColor from "../../hooks/useAnimatedColor"

/**
 * @param offColorRGB @type {ColorValue} 'rgb(r, g, b)' type value only
 * @param onColorRGB @type {ColorValue} 'rgb(r, g, b)' type value only
 */
const ButtonWithHoverColorAnimation = (props: {onPress: () => void, children: View['props']['children'], offBgColorRGB: ColorValue, onBgColorRGB: ColorValue, duration?: number, style?: StyleProp<ViewStyle>}) => {
  const {
    onPress,
    children,
    offBgColorRGB,
    onBgColorRGB,
    duration=100,
    style,
  } = props

  const ref = React.useRef(null)
  const isHovered = useHover(ref)
  const interpolatedBgColor = useAnimatedColor(isHovered, duration, offBgColorRGB, onBgColorRGB)

  return (
    <TouchableOpacity onPress={onPress} ref={ref}>
      <Animated.View style={[style, {backgroundColor: interpolatedBgColor}]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  )
}
export default ButtonWithHoverColorAnimation
