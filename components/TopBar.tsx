import React, { Dispatch, SetStateAction } from 'react'
import { Animated, Platform, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native'
import CloseIcon from '../assets/icon-close.svg'
import DeleteIcon from '../assets/icon-delete.svg'
import DocumentIcon from '../assets/icon-document.svg'
import HamburgerIcon from '../assets/icon-menu.svg'
import SaveIcon from '../assets/icon-save.svg'
import useMediaquery, { MediaType } from '../hooks/useMediaquery'
import colors from '../theme/colors'
import textStyles from '../theme/textStyles'
import SvgWrapper from './common/SvgWrapper'
import { Text, TextInput } from './common/withCustomFont'
import Title from './Title'

export const TOP_BAR_HEIGHT = 72

const styles = StyleSheet.create({
  container: {
    height: TOP_BAR_HEIGHT,
    backgroundColor: colors[800],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    /** Use 2 lines below to check how input layout works */
    // borderWidth: 1,
    // borderColor: 'red',
  },
  menuButton: {
    height: TOP_BAR_HEIGHT,
    width: TOP_BAR_HEIGHT,
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
    /** Use 2 lines below to check how input layout works */
    // borderWidth: 1,
    // borderColor: 'yellow',
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
  },
  documentTitleInputUnderline: {
    height: 1,
    backgroundColor: colors[100],
    marginTop: 5,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    marginRight: 13,
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    marginRight: 16,
    height: 40,
    paddingLeft: 16,
    paddingRight: 16,
    backgroundColor: colors.Orange,
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonLabel: {
    marginLeft: 8,
    color: colors[100],
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
      <View style={styles.leftContainer}>
        <MenuButton toggle={() => setShowSidebar(value => !value)} isOpen={showSidebar} />
        {mediaType === MediaType.DESKTOP &&
          <>
            <Title style={styles.title} />
            <View style={styles.border} />
          </>
        }
        <DocumentTitle />
      </View>
      <View style={styles.rightContainer}>
        <DeleteButton onPress={() => console.log('delete')} />
        <SaveButton onPress={() => console.log('save')} />
      </View>
    </View>
  )
}

const MenuButton = (props: {toggle: () => void, isOpen: boolean}) => {
  const {
    toggle,
    isOpen,
  } = props

  return (
    <TouchableOpacity onPress={toggle} style={styles.menuButton}>
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
    if (documentTitle.replace(/\s*/, '') === '') {
      setDocumentTitle('Untitled Document.md')
      return
    }
    if (/\.md\s*$/.test(documentTitle)) {
      setDocumentTitle(documentTitle => `${documentTitle.replace(/^\s*/, '').replace(/\s*$/, '')}`)
      return
    }
    if (/\.m\s*$/.test(documentTitle)) {
      setDocumentTitle(documentTitle => `${documentTitle.replace(/^\s*/, '').replace(/\s*$/, '')}d`)
      return
    }
    if (/\.\s*$/.test(documentTitle)) {
      setDocumentTitle(documentTitle => `${documentTitle.replace(/^\s*/, '').replace(/\s*$/, '')}md`)
      return
    }
    setDocumentTitle(documentTitle => `${documentTitle.replace(/^\s*/, '').replace(/\s*$/, '')}.md`)
  }

  const [onFocus, setOnFocus] = React.useState(false)
  React.useEffect(() => {
    onFocus ? focusAnim() : blurAnim()
  }, [onFocus])

  const mediaType = useMediaquery()
  const {width: windowWidth} = useWindowDimensions()
  const INPUT_MAX_WIDTH = 272
  const inputWidth = React.useMemo(() => Math.min(windowWidth - (mediaType !== MediaType.MOBILE ? 355 : 255), INPUT_MAX_WIDTH), [windowWidth])

  const borderBottomWidthAnim = React.useRef(new Animated.Value(0)).current
  const focusAnim = () => {
    Animated.timing(borderBottomWidthAnim, {
      toValue: inputWidth,
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

  return (
    <View style={styles.documentTitleContainer}>
      <SvgWrapper>
        <DocumentIcon />
      </SvgWrapper>
      <View style={styles.textsContainer}>
        {mediaType !== MediaType.MOBILE && <Text style={[styles.documentTitleLabel, textStyles.bodyM]}>Document Name</Text>}
        <TextInput
          style={[styles.documentTitleInput, textStyles.headingM, {width: inputWidth}]}
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

const DeleteButton = (props: {onPress: () => void}) => {
  const {
    onPress,
  } = props

  return (
    <TouchableOpacity onPress={onPress} style={styles.deleteButton}>
      <SvgWrapper>
        <DeleteIcon />
      </SvgWrapper>
    </TouchableOpacity>
  )
}

const SaveButton = (props: {onPress: () => void}) => {
  const {
    onPress,
  } = props

  const mediaType = useMediaquery()

  return (
    <TouchableOpacity onPress={onPress} style={styles.saveButton}>
      <SvgWrapper>
        <SaveIcon />
      </SvgWrapper>
      {mediaType !== MediaType.MOBILE && <Text style={[styles.saveButtonLabel, textStyles.headingM]}>Save Changes</Text>}
    </TouchableOpacity>
  )
}

export default TopBar
