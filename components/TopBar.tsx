import React, { Dispatch, SetStateAction } from 'react'
import { Animated, Platform, StyleSheet, TouchableOpacity, View } from 'react-native'
import CloseIcon from '../assets/icon-close.svg'
import DocumentIcon from '../assets/icon-document.svg'
import HamburgerIcon from '../assets/icon-menu.svg'
import useMediaquery, { MediaType } from '../hooks/useMediaquery'
import colors from '../theme/colors'
import textStyles from '../theme/textStyles'
import SvgWrapper from './common/SvgWrapper'
import { Text, TextInput } from './common/withCustomFont'
import Title from './Title'

export const TOP_BAR_HEIGHT = 72
const BORDER_BOTTOM_WIDTH = 272

const styles = StyleSheet.create({
  container: {
    height: TOP_BAR_HEIGHT,
    backgroundColor: colors[800],
    flexDirection: 'row',
    alignItems: 'center',
  },
  hamburgerButton: {
    alignSelf: 'stretch',
    width: 72,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors[700],
  },
  title: {
    marginLeft: 24,
    marginRight: 29,
  },
  border: {
    height: 40,
    width: 1,
    backgroundColor: colors[600],
  },
  documentTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 24,
  },
  textsContainer: {
    marginLeft: 17,
  },
  documentTitleLabel: {
    color: colors[500],
  },
  documentTitleInput: {
    marginTop: 3,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
        caretColor: colors.Orange,
      }
    }),
    color: colors[100],
    minWidth: BORDER_BOTTOM_WIDTH,
  },
  documentTitleInputUnderline: {
    height: 1,
    backgroundColor: colors[100],
    marginTop: 5,
  },
})

const TopBar = (props: {setShowSidebar: Dispatch<SetStateAction<boolean>>, showSidebar: boolean}) => {
  const {
    setShowSidebar,
    showSidebar,
  } = props

  const mediaType = useMediaquery()

  return (
    <View style={styles.container}>
      <HamburgerButton toggle={() => setShowSidebar(value => !value)} isOpen={showSidebar} />
      {mediaType === MediaType.DESKTOP &&
        <>
          <Title style={styles.title} />
          <View style={styles.border} />
        </>
      }
      <DocumentTitle />
    </View>
  )
}

const HamburgerButton = (props: {toggle: () => void, isOpen: boolean}) => {
  const {
    toggle,
    isOpen,
  } = props

  return (
    <TouchableOpacity onPress={toggle} style={styles.hamburgerButton}>
      <SvgWrapper>
        {isOpen ? <CloseIcon /> : <HamburgerIcon />}
      </SvgWrapper>
    </TouchableOpacity>
  )
}

const ANIM_DURATION = 200

const DocumentTitle = () => {
  const [documentTitle, setDocumentTitle] = React.useState('')
  const addExtension = () => {
    if (/\.md\s*$/.test(documentTitle)) {
      setDocumentTitle(documentTitle => `${documentTitle.replace(/\s*$/, '')}`)
      return
    }
    if (/\.m\s*$/.test(documentTitle)) {
      setDocumentTitle(documentTitle => `${documentTitle.replace(/\s*$/, '')}d`)
      return
    }
    if (/\.\s*$/.test(documentTitle)) {
      setDocumentTitle(documentTitle => `${documentTitle.replace(/\s*$/, '')}md`)
      return
    }
    setDocumentTitle(documentTitle => `${documentTitle.replace(/\s*$/, '')}.md`)
  }

  const [onFocus, setOnFocus] = React.useState(false)
  React.useEffect(() => {
    onFocus ? focusAnim() : blurAnim()
  }, [onFocus])

  const borderBottomWidthAnim = React.useRef(new Animated.Value(0)).current
  const focusAnim = () => {
    Animated.timing(borderBottomWidthAnim, {
      toValue: BORDER_BOTTOM_WIDTH,
      duration: ANIM_DURATION,
      useNativeDriver: false
    }).start()
  }
  const blurAnim = () => {
    Animated.timing(borderBottomWidthAnim, {
      toValue: 0,
      duration: ANIM_DURATION,
      useNativeDriver: false
    }).start()
  }

  const handleFocus = () => {
    setOnFocus(true)
  }
  const handleBlur = () => {
    setOnFocus(false)
    addExtension()
  }

  const mediaType = useMediaquery()

  return (
    <View style={styles.documentTitleContainer}>
      <SvgWrapper>
        <DocumentIcon />
      </SvgWrapper>
      <View style={styles.textsContainer}>
        {mediaType !== MediaType.MOBILE && <Text style={[styles.documentTitleLabel, textStyles.bodyM]}>Document Name</Text>}
        <TextInput
          style={[styles.documentTitleInput, textStyles.headingM]}
          selectionColor={colors.Orange}
          value={documentTitle}
          onChangeText={setDocumentTitle}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        <Animated.View style={[styles.documentTitleInputUnderline, {width: borderBottomWidthAnim}]} />
      </View>
    </View>
  )
}

export default TopBar
