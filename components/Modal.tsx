import { StyleSheet, View } from 'react-native'

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

const Modal = (props: {children: JSX.Element}) => {
  const {
    children,
  } = props
  return (
    <View style={styles.container}>
      {children}
    </View>
  )
}

export default Modal
