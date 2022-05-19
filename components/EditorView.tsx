import React from 'react'
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native'
import colors from '../theme/colors'
import textStyles from '../theme/textStyles'
import { TextInput } from './common/withCustomFont'
import { PREVIEW_PADDING_LEFT, PREVIEW_PADDING_RIGHT } from './EditorView.constants'
import Preview from './Preview'
import { TOP_BAR_HEIGHT } from './TopBar'

const HEADER_HEIGHT = 42

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
  },
  header: {
    flex: 1,
    height: HEADER_HEIGHT,
    backgroundColor: colors[200],
  },
  viewContainer: {
    flexDirection: 'row',
  },
  view: {
    flex: 1,
  },
  textInput: {
    flex: 1,
    outlineStyle: 'none',
    paddingTop: 9,
    paddingBottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
  },
  preview: {
    flex: 1,
    paddingTop: 22,
    paddingBottom: 122,
    paddingLeft: PREVIEW_PADDING_LEFT,
    paddingRight: PREVIEW_PADDING_RIGHT,
  },
  borderLeft: {
    borderColor: colors[300],
    borderLeftWidth: 1,
  },
})

const EditorView = () => {
  const [input, setInput] = React.useState('')
  const windowHeight = useWindowDimensions().height
  const scrollViewHeight = windowHeight - TOP_BAR_HEIGHT - HEADER_HEIGHT

  return (
    <View>
      <View style={styles.headerContainer}>
        <View style={styles.header}></View>
        <View style={[styles.header, styles.borderLeft]}></View>
      </View>
      <ScrollView style={{height: scrollViewHeight}}>
        <View style={[styles.viewContainer, {minHeight: scrollViewHeight}]}>
          <View style={styles.view}>
            <TextInput
              multiline
              style={[styles.textInput, textStyles.markdownCode]}
              value={input}
              onChangeText={setInput}
              autoCapitalize='none'
              autoCorrect={false}
            />
          </View>
          <View style={[styles.view, styles.borderLeft]}>
            <Preview style={[styles.preview]}>{input}</Preview>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

export default EditorView
