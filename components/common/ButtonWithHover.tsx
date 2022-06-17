import Constants from 'expo-constants'
import React from "react"
import { Animated, ColorValue, StyleProp, TouchableOpacity, View, ViewStyle } from 'react-native'
import { useHover } from "react-native-web-hooks"
import useAnimatedColor from "../../hooks/useAnimatedColor"

/**
 * @param offColorRGB @type {ColorValue} 'rgb(r, g, b)' type value only
 * @param onColorRGB @type {ColorValue} 'rgb(r, g, b)' type value only
 */
const ButtonWithHover = (props: {onPress: () => void, children: View['props']['children'], offColorRGB: ColorValue, onColorRGB: ColorValue, style?: StyleProp<ViewStyle>}) => {
  const {
    onPress,
    children,
    offColorRGB,
    onColorRGB,
    style,
  } = props

  const ref = React.useRef(null)
  const isHovered = useHover(ref)
  const interpolatedBgColor = useAnimatedColor(isHovered, Constants.manifest?.extra?.BUTTON_COLOR_ANIM_DURATION, offColorRGB, onColorRGB)

  return (
    <TouchableOpacity onPress={onPress} ref={ref}>
      <Animated.View style={[style, {backgroundColor: interpolatedBgColor}]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  )
}
export default ButtonWithHover
