import { StyleSheet, View } from 'react-native'
import colors from '../theme/colors'
import textStyles from '../theme/textStyles'
import TextInputWithCustomFont from './TextInputWithCustomFont'

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 42,
    backgroundColor: colors[200],
  },
  text: {
    flex: 1,
  },
})

const EditorView = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}></View>
      <TextInputWithCustomFont multiline style={[styles.text, textStyles.markdownCode]} />
    </View>
  )
}

export default EditorView
