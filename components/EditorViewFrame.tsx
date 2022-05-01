import { StyleSheet, View } from 'react-native'
import EditorView from './EditorView'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
})

const EditorViewFrame = () => {
  return (
    <View style={styles.container}>
      <EditorView />
      <EditorView />
    </View>
  )
}

export default EditorViewFrame
