import { StyleSheet, TouchableWithoutFeedback, View } from 'react-native'

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'hsla(225, 9%, 9%, 0.5)',
  },
})

const Modal = (props: {children: JSX.Element, onPressBackground: () => void}) => {
  const {
    children,
    onPressBackground,
  } = props
  return (
    <TouchableWithoutFeedback onPress={onPressBackground}>
      <View style={styles.container}>
        {children}
      </View>
    </TouchableWithoutFeedback>
  )
}

export default Modal
