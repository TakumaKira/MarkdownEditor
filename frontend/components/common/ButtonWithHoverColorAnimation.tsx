import React from "react"
import { Animated, ColorValue, StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native'
import { useHover } from "react-native-web-hooks"
import useAnimatedColor from "../../hooks/useAnimatedColor"

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    width: '100%'
  },
  preventUnwantedStretchOnIos: {
    maxWidth: '100%',
  },
})

/**
 * @param offColorRGB @type {ColorValue} 'rgb(r, g, b)' type value only
 * @param onColorRGB @type {ColorValue} 'rgb(r, g, b)' type value only
 */
const ButtonWithHoverColorAnimation = (props: {
  onPress: () => void
  children: View['props']['children']
  offBgColorRGB: ColorValue
  onBgColorRGB: ColorValue
  duration?: number
  style?: StyleProp<ViewStyle>
  childrenWrapperStyle?: StyleProp<ViewStyle>
  disabled?: boolean
}) => {
  const {
    onPress,
    children,
    offBgColorRGB,
    onBgColorRGB,
    duration=100,
    style,
    childrenWrapperStyle,
    disabled,
  } = props

  const ref = React.useRef(null)
  const isHovered = useHover(ref)
  const interpolatedBgColor = useAnimatedColor(isHovered, duration, offBgColorRGB, onBgColorRGB)

  return (
    <TouchableOpacity onPress={onPress} ref={ref} style={[styles.clip, style]} disabled={disabled}>
      <Animated.View style={[styles.fill, {backgroundColor: disabled ? offBgColorRGB : interpolatedBgColor}]}>
        <View style={[styles.fill, styles.preventUnwantedStretchOnIos, childrenWrapperStyle]}>
          {children}
        </View>
      </Animated.View>
    </TouchableOpacity>
  )
}
export default ButtonWithHoverColorAnimation
