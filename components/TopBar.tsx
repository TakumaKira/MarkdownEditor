import Constants from 'expo-constants'
import React, { Dispatch, SetStateAction } from 'react'
import { Animated, Platform, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native'
import CloseIcon from '../assets/icon-close.svg'
import DeleteIcon from '../assets/icon-delete.svg'
import DocumentIcon from '../assets/icon-document.svg'
import HamburgerIcon from '../assets/icon-menu.svg'
import SaveIcon from '../assets/icon-save.svg'
import { ConfirmationState, useInputContext } from '../contexts/inputContext'
import useMediaquery, { MediaType } from '../hooks/useMediaquery'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { saveDocument, selectSelectedDocument } from '../store/slices/document'
import { selectColorScheme } from '../store/slices/theme'
import colors from '../theme/colors'
import textStyles from '../theme/textStyles'
import themeColors from '../theme/themeColors'
import ButtonWithHoverColorAnimation from './common/ButtonWithHoverColorAnimation'
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

  const {titleInput, mainInput, setConfirmationState} = useInputContext()
  const dispatch = useAppDispatch()
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
        <DeleteButton onPress={() => setConfirmationState({state: ConfirmationState.DELETE})} />
        <SaveButton onPress={() => dispatch(saveDocument({titleInput, mainInput}))} />
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
    <ButtonWithHoverColorAnimation onPress={toggle} offBgColorRGB={colors[700]} onBgColorRGB={colors.Orange} duration={0} style={styles.menuButton}>
      <SvgWrapper>
        {isOpen ? <CloseIcon /> : <HamburgerIcon />}
      </SvgWrapper>
    </ButtonWithHoverColorAnimation>
  )
}

const BORDER_BOTTOM_WIDTH_ANIM_DURATION = 200

const DocumentTitle = () => {
  const selectedDocument = useAppSelector(selectSelectedDocument)
  React.useEffect(() => {
    if (selectedDocument) {
      setTitleInput(selectedDocument.name)
    }
  }, [selectedDocument])

  const {titleInput, setTitleInput} = useInputContext()
  const addExtension = () => {
    if (titleInput.replace(/\s*/, '') === '') {
      setTitleInput(Constants.manifest?.extra?.NEW_DOCUMENT_TITLE)
      return
    }
    if (/\.md\s*$/.test(titleInput)) {
      setTitleInput(documentTitle => `${documentTitle.replace(/^\s*/, '').replace(/\s*$/, '')}`)
      return
    }
    if (/\.m\s*$/.test(titleInput)) {
      setTitleInput(documentTitle => `${documentTitle.replace(/^\s*/, '').replace(/\s*$/, '')}d`)
      return
    }
    if (/\.\s*$/.test(titleInput)) {
      setTitleInput(documentTitle => `${documentTitle.replace(/^\s*/, '').replace(/\s*$/, '')}md`)
      return
    }
    setTitleInput(documentTitle => `${documentTitle.replace(/^\s*/, '').replace(/\s*$/, '')}.md`)
  }

  const [onFocus, setOnFocus] = React.useState(false)
  React.useEffect(() => {
    onFocus ? focusAnim() : blurAnim()
  }, [onFocus])

  const mediaType = useMediaquery()
  const {width: windowWidth} = useWindowDimensions()
  const INPUT_MAX_WIDTH = 272
  const inputWidth = React.useMemo(() => Math.min(windowWidth - (mediaType !== MediaType.MOBILE ? 355 : 255), INPUT_MAX_WIDTH), [windowWidth])

  const colorScheme = useAppSelector(selectColorScheme)

  const borderBottomWidthAnim = React.useRef(new Animated.Value(0)).current
  const focusAnim = () => {
    Animated.timing(borderBottomWidthAnim, {
      toValue: inputWidth,
      duration: BORDER_BOTTOM_WIDTH_ANIM_DURATION,
      useNativeDriver: false
    }).start()
  }
  const blurAnim = () => {
    Animated.timing(borderBottomWidthAnim, {
      toValue: 0,
      duration: BORDER_BOTTOM_WIDTH_ANIM_DURATION,
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
        {mediaType !== MediaType.MOBILE && <Text style={[textStyles.bodyM, themeColors[colorScheme].documentTitleLabel]}>Document Name</Text>}
        <TextInput
          style={[styles.documentTitleInput, textStyles.headingM, {width: inputWidth}]}
          selectionColor={colors.Orange}
          value={titleInput}
          onChangeText={setTitleInput}
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
    <ButtonWithHoverColorAnimation onPress={onPress} offBgColorRGB={colors.Orange} onBgColorRGB={colors.OrangeHover} style={styles.saveButton}>
      <SvgWrapper>
        <SaveIcon />
      </SvgWrapper>
      {mediaType !== MediaType.MOBILE && <Text style={[styles.saveButtonLabel, textStyles.headingM]}>Save Changes</Text>}
    </ButtonWithHoverColorAnimation>
  )
}

export default TopBar
