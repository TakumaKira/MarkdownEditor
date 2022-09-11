import { StyleSheet, TouchableWithoutFeedback, View } from 'react-native'
import { useAppSelector } from '../../store/hooks'
import { selectColorScheme } from '../../store/slices/theme'
import themeColors from '../../theme/themeColors'

const styles = StyleSheet.create({
  fullscreen: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  background: {
    opacity: 0.5,
  },
})

const Modal = (props: {children: JSX.Element, onPressBackground?: () => void}) => {
  const {
    children,
    onPressBackground,
  } = props

  const colorScheme = useAppSelector(selectColorScheme)

  return (
    <View style={styles.fullscreen}>
      <TouchableWithoutFeedback onPress={onPressBackground}>
          <View style={[styles.fullscreen, styles.background, themeColors[colorScheme].modalBackgroundColor]} />
      </TouchableWithoutFeedback>
      {children}
    </View>
  )
}

export default Modal
