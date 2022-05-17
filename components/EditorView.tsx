import { StyleSheet, View } from 'react-native'
import colors from '../theme/colors'

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 42,
    backgroundColor: colors[200],
  },
})

const EditorView = (props: {children: JSX.Element}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}></View>
      {props.children}
    </View>
  )
}

export default EditorView
