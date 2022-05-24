import React from 'react'
import { Platform, ScrollView, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native'
import HideIcon from '../assets/icon-hide-preview.svg'
import ShowIcon from '../assets/icon-show-preview.svg'
import useMediaquery, { MediaType } from '../hooks/useMediaquery'
import colors from '../theme/colors'
import textStyles from '../theme/textStyles'
import SvgWrapper from './common/SvgWrapper'
import { Text, TextInput } from './common/withCustomFont'
import Preview from './Preview'
import { TOP_BAR_HEIGHT } from './TopBar'

const HEADER_HEIGHT = 42
const PREVIEW_PADDING_LEFT = 23
const PREVIEW_PADDING_RIGHT = 24

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
  },
  header: {
    flex: 1,
    height: HEADER_HEIGHT,
    backgroundColor: colors[200],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    color: colors[500],
    marginLeft: 16,
  },
  showPreviewButton: {
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
  },
  preview: {
    flex: 1,
    paddingTop: 22,
    paddingBottom: 122,
    paddingLeft: PREVIEW_PADDING_LEFT,
    paddingRight: PREVIEW_PADDING_RIGHT,
  },
  borderRight: {
    borderColor: colors[300],
    borderRightWidth: 1,
  },
})

const EditorView = () => {
  const [input, setInput] = React.useState('')
  const {height: windowHeight, width: windowWidth} = useWindowDimensions()
  const scrollViewHeight = windowHeight - TOP_BAR_HEIGHT - HEADER_HEIGHT
  const [isEditable, toggleIsEditable] = React.useState(true)

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

  const viewerWidth = React.useMemo(() => {
    if (!showPreview) {
      return 0
    }
    if (showMarkdown) {
      return windowWidth / 2 - 1 - PREVIEW_PADDING_LEFT - PREVIEW_PADDING_RIGHT
    }
    return windowWidth - PREVIEW_PADDING_LEFT - PREVIEW_PADDING_RIGHT
  }, [windowWidth, showMarkdown, showPreview])

  return (
    <View>
      <View style={styles.headerContainer}>
        {showMarkdown && <MarkdownHeader showPreview={showPreview} isMobile={isMobile} toggleMarkdown={toggleMarkdown} />}
        {showPreview && <PreviewHeader isEditable={isEditable} toggleMarkdown={toggleMarkdown} />}
      </View>
      <ScrollView style={{height: scrollViewHeight}}>
        <View style={[styles.viewContainer, {minHeight: scrollViewHeight}]}>
          {showMarkdown && <MarkdownView showPreview={showPreview} input={input} setInput={setInput} />}
          {showPreview && <PreviewView input={input} viewerWidth={viewerWidth} />}
        </View>
      </ScrollView>
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
    <View style={[styles.header, showPreview ? styles.borderRight : undefined]}>
      <Text style={[styles.headerText, textStyles.headingS]}>MARKDOWN</Text>
      {isMobile &&
        <TouchableOpacity style={styles.showPreviewButton} onPress={toggleMarkdown}>
          <SvgWrapper>
            <ShowIcon />
          </SvgWrapper>
        </TouchableOpacity>
      }
    </View>
  )
}
const MarkdownView = (props: {showPreview: boolean, input: string, setInput: React.Dispatch<React.SetStateAction<string>>}) => {
  const {
    showPreview,
    input,
    setInput,
  } = props
  return (
    <View style={[styles.view, showPreview ? styles.borderRight : undefined]}>
      <TextInput
        multiline
        style={[styles.textInput, textStyles.markdownCode]}
        value={input}
        onChangeText={setInput}
        autoCapitalize='none'
        autoCorrect={false}
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
    <View style={styles.header}>
      <Text style={[styles.headerText, textStyles.headingS]}>PREVIEW</Text>
      <TouchableOpacity style={styles.showPreviewButton} onPress={toggleMarkdown}>
        <SvgWrapper>
          {isEditable ? <ShowIcon /> : <HideIcon />}
        </SvgWrapper>
      </TouchableOpacity>
    </View>
  )
}
const PreviewView = (props: {input: string, viewerWidth: number}) => {
  const {
    input,
    viewerWidth,
  } = props
  return (
    <View style={styles.view}>
      <Preview style={[styles.preview]} viewerWidth={viewerWidth}>{input}</Preview>
    </View>
  )
}

export default EditorView
