import React from 'react'
import { Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import HideIconDark from '../assets/icon-hide-preview-for-dark-mode.svg'
import HideIcon from '../assets/icon-hide-preview.svg'
import ShowIconDark from '../assets/icon-show-preview-for-dark-mode.svg'
import ShowIcon from '../assets/icon-show-preview.svg'
import useMediaquery, { MediaType } from '../hooks/useMediaquery'
import useWindowDimensions from '../hooks/useWindowDimensions'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { selectSelectedDocumentOnEdit, updateMainInput } from '../store/slices/document'
import { selectColorScheme } from '../store/slices/theme'
import textStyles from '../theme/textStyles'
import themeColors from '../theme/themeColors'
import SvgWrapper from './common/SvgWrapper'
import { Text, TextInput } from './common/withCustomFont'
import Preview from './Preview'

const HEADER_HEIGHT = 42
const PREVIEW_PADDING_LEFT = 23
const PREVIEW_PADDING_RIGHT = 24

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  headerContainer: {
    flexDirection: 'row',
  },
  scrollView: {
    flexGrow: 0,
  },
  header: {
    flex: 1,
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 16,
  },
  toggleModeButton: {
    alignSelf: 'stretch',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  viewContainer: {
    flexDirection: 'row',
  },
  view: {
    flex: 1,
  },
  textInput: {
    flex: 1,
    ...Platform.select({
      web: {
        outlineStyle: 'none'
      }
    }),
    paddingTop: 9,
    paddingBottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
    textAlignVertical: 'top', // Need this for android
  },
  previewWrapper: {
    alignItems: 'stretch',
  },
  preview: {
    flex: 1,
    paddingTop: 22,
    paddingBottom: 122,
    paddingLeft: PREVIEW_PADDING_LEFT,
    paddingRight: PREVIEW_PADDING_RIGHT,
    maxWidth: PREVIEW_PADDING_LEFT + 672 + PREVIEW_PADDING_RIGHT,
  },
  borderRight: {
    borderRightWidth: 1,
  },
})

const EditorView = (props: {maxHeight?: number}) => {
  const {
    maxHeight,
  } = props

  const {height: windowHeight} = useWindowDimensions()
  const scrollViewHeight = maxHeight ? maxHeight - HEADER_HEIGHT : windowHeight - HEADER_HEIGHT
  const [isEditable, toggleIsEditable] = React.useState(true)
  const {mainInput} = useAppSelector(selectSelectedDocumentOnEdit)
  const dispatch = useAppDispatch()

  const mediaType = useMediaquery()
  const isMobile = React.useMemo(() => {
    return mediaType === MediaType.MOBILE
  }, [mediaType])

  const toggleMarkdown = () => {
    toggleIsEditable(value => !value)
  }
  const showMarkdown = React.useMemo(() => {
    return isEditable
  }, [isEditable])
  const showPreview = React.useMemo(() => {
    return isMobile
      ? !isEditable
      : true
  }, [isEditable, isMobile])

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        {showMarkdown && <MarkdownHeader showPreview={showPreview} isMobile={isMobile} toggleMarkdown={toggleMarkdown} />}
        {showPreview && <PreviewHeader isEditable={isEditable} toggleMarkdown={toggleMarkdown} />}
      </View>
      <ScrollView
        style={[styles.scrollView, {height: scrollViewHeight}]}
        contentContainerStyle={[styles.viewContainer, {minHeight: scrollViewHeight}]}
      >
        {showMarkdown && <MarkdownView showPreview={showPreview} input={mainInput} setInput={input => dispatch(updateMainInput(input))} />}
        {showPreview && <PreviewView input={mainInput} />}
      </ScrollView>
    </View>
  )
}

const HeaderBase = (props: {label: string, mode: 'show' | 'hide', showToggleModeButton: boolean, toggleMode: () => void, showBorderRight: boolean}) => {
  const {
    label,
    mode,
    showToggleModeButton,
    toggleMode,
    showBorderRight,
  } = props

  const colorScheme = useAppSelector(selectColorScheme)

  return (
    <View style={[styles.header, themeColors[colorScheme].editorHeaderBg, showBorderRight ? styles.borderRight : undefined, showBorderRight ? themeColors[colorScheme].editorSeparator : undefined]}>
      <Text style={[styles.headerText, themeColors[colorScheme].editorHeaderText, textStyles.headingS]}>{label}</Text>
      {showToggleModeButton &&
        <TouchableOpacity style={styles.toggleModeButton} onPress={toggleMode}>
          <SvgWrapper>
            {mode === 'show'
              ? colorScheme === 'dark' ? <ShowIconDark /> : <ShowIcon />
              : colorScheme === 'dark' ? <HideIconDark /> : <HideIcon />
            }
          </SvgWrapper>
        </TouchableOpacity>
      }
    </View>
  )
}
const MarkdownHeader = (props: {showPreview: boolean, isMobile: boolean, toggleMarkdown: () => void}) => {
  const {
    showPreview,
    isMobile,
    toggleMarkdown,
  } = props

  return (
    <HeaderBase
      label="MARKDOWN"
      mode="show"
      showToggleModeButton={isMobile}
      toggleMode={toggleMarkdown}
      showBorderRight={showPreview}
    />
  )
}
const MarkdownView = (props: {showPreview: boolean, input: string, setInput: (input: string) => void}) => {
  const {
    showPreview,
    input,
    setInput,
  } = props

  const colorScheme = useAppSelector(selectColorScheme)

  return (
    <View style={[styles.view, showPreview ? styles.borderRight : undefined, themeColors[colorScheme].editorBg, themeColors[colorScheme].editorSeparator]}>
      <TextInput
        multiline
        style={[styles.textInput, textStyles.markdownCode, themeColors[colorScheme].editorMarkdown]}
        value={input}
        onChangeText={setInput}
        autoCapitalize='none'
        autoCorrect={false}
        testID="main-editor-input"
      />
    </View>
  )
}
const PreviewHeader = (props: {isEditable: boolean, toggleMarkdown: () => void}) => {
  const {
    isEditable,
    toggleMarkdown,
  } = props

  return (
    <HeaderBase
      label="PREVIEW"
      mode={isEditable ? 'show' : 'hide'}
      showToggleModeButton={true}
      toggleMode={toggleMarkdown}
      showBorderRight={false}
    />
  )
}
const PreviewView = (props: {input: string}) => {
  const {
    input,
  } = props

  const colorScheme = useAppSelector(selectColorScheme)

  return (
    <View style={[styles.view, styles.previewWrapper, themeColors[colorScheme].editorBg]}>
      <Preview style={styles.preview}>{input}</Preview>
    </View>
  )
}

export default EditorView
