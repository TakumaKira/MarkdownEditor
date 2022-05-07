import React from 'react'
import { StyleSheet, View } from 'react-native'
import textStyles from '../theme/textStyles'
import { TextInput } from './common/withCustomFont'
import EditorView from './EditorView'
import Preview from './Preview'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  textInput: {
    flex: 1,
  },
})

const EditorViewFrame = () => {
  const [input, setInput] = React.useState('')

  return (
    <View style={styles.container}>
      <EditorView>
        <TextInput
          multiline
          style={[styles.textInput, textStyles.markdownCode]}
          value={input}
          onChangeText={setInput}
        />
      </EditorView>
      <EditorView>
        <Preview>{input}</Preview>
      </EditorView>
    </View>
  )
}

export default EditorViewFrame
