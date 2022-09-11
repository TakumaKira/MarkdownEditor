import React from 'react';
import { Animated, ColorValue, Easing, LayoutRectangle, StyleSheet, View } from 'react-native';

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
})

const DURATION = 300
const RATIO_RADIUS_WIDTH = 0.225
const RATIO_MARGIN_WIDTH = (1 - RATIO_RADIUS_WIDTH * 3) / 2
const RATIO_MARGIN_RADIUS = RATIO_MARGIN_WIDTH / RATIO_RADIUS_WIDTH

/**
 * @param circleColorRGB @type {ColorValue} 'rgb(r, g, b)' type value only
 */
const LoadingCircles = (props: {
  circleColorRGB?: ColorValue
}) => {
  const {
    circleColorRGB = 'rgb(79, 82, 83)',
  } = props

  const [radius, setRadius] = React.useState<number>(0)
  const [margin, setMargin] = React.useState<number>(0)
  const getLayout = (layout: LayoutRectangle) => {
    const {height, width} = layout
    const radius = Math.min(width * RATIO_RADIUS_WIDTH, height)
    const margin = radius * RATIO_MARGIN_RADIUS
    setRadius(radius)
    setMargin(margin)
  }

  const [opacityLeft] = React.useState(new Animated.Value(0))
  const [opacityCenter] = React.useState(new Animated.Value(0))
  const [opacityRight] = React.useState(new Animated.Value(0))
  const getSequence = (opacity: Animated.Value, phase: number) => {
    const unit = DURATION / 15
    const offset = phase * 3
    return Animated.sequence([
      Animated.delay(unit * offset),
      Animated.timing(opacity, {
        toValue: 1,
        duration: unit * (4.5 + offset),
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: unit * (9 + offset),
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ])
  }
  React.useEffect(() => {
    Animated.loop(
      Animated.parallel([
        getSequence(opacityLeft, 0),
        getSequence(opacityCenter, 1),
        getSequence(opacityRight, 2),
      ])
    ).start()
  }, [])

  return (
    <View style={styles.container} onLayout={e => getLayout(e.nativeEvent.layout)}>
      <Animated.View style={{backgroundColor: circleColorRGB, opacity: opacityLeft, height: radius, width: radius, borderRadius: radius / 2}} />
      <Animated.View style={{backgroundColor: circleColorRGB, opacity: opacityCenter, height: radius, width: radius, borderRadius: radius / 2, marginLeft: margin}} />
      <Animated.View style={{backgroundColor: circleColorRGB, opacity: opacityRight, height: radius, width: radius, borderRadius: radius / 2, marginLeft: margin}} />
    </View>
  )
}
export default LoadingCircles
