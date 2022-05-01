import { StyleSheet, TextInput, View } from 'react-native'

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 42,
    backgroundColor: '#F5F5F5',
  },
  text: {
    flex: 1,
  },
})

const EditorView = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}></View>
      <TextInput multiline style={styles.text} />
    </View>
  )
}

export default EditorView
