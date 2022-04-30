import { StyleSheet, Text, View } from 'react-native'

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

const EditorView = () => {
  return (
    <View style={styles.container}>
      <Text>EditorView</Text>
    </View>
  )
}

export default EditorView
