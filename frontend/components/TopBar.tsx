import React, { Dispatch, SetStateAction } from 'react'
import { Animated, Platform, StyleSheet, View } from 'react-native'
import env from '../env'
import CloseIcon from '../assets/icon-close.svg'
import DeleteIcon from '../assets/icon-delete.svg'
import DocumentIcon from '../assets/icon-document.svg'
import HamburgerIcon from '../assets/icon-menu.svg'
import SaveIcon from '../assets/icon-save.svg'
import { ConfirmationStateTypes } from '../constants/confirmationMessages'
import useMediaquery, { MediaType } from '../hooks/useMediaquery'
import useWindowDimensions from '../hooks/useWindowDimensions'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { confirmationStateChanged, saveDocument, selectSelectedDocumentOnEdit, updateTitleInput } from '../store/slices/document'
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
  },
  /** For checking how input layout works on Storybook */
  leftContainerOutline: {
    borderWidth: 1,
    borderColor: 'red',
  },
  menuButton: {
    height: TOP_BAR_HEIGHT,
    width: TOP_BAR_HEIGHT,
  },
  menuButtonContents: {
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
  },
  /** For checking how input layout works on Storybook */
  textsContainerOutline: {
    borderWidth: 1,
    borderColor: 'yellow',
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
    borderRadius: 4,
  },
  deleteButtonContents: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    marginRight: 16,
    height: 40,
    borderRadius: 4,
  },
  saveButtonContents: {
    paddingLeft: 16,
    paddingRight: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonLabel: {
    marginLeft: 8,
    color: colors[100],
  },
})

const TopBar = (props: {setShowSidebar: Dispatch<SetStateAction<boolean>>, showSidebar: boolean, checkLayout?: boolean, mockWindowWidth?: number}) => {
  const {
    setShowSidebar,
    showSidebar,
    checkLayout,
    mockWindowWidth,
  } = props

  const dispatch = useAppDispatch()
  const mediaType = useMediaquery({width: mockWindowWidth})

  return (
    <View style={styles.container}>
      <View style={[styles.leftContainer, checkLayout ? styles.leftContainerOutline : undefined]}>
        <MenuButton toggle={() => setShowSidebar(value => !value)} isOpen={showSidebar} />
        {mediaType === MediaType.DESKTOP &&
          <>
            <Title style={styles.title} />
            <View style={styles.border} />
          </>
        }
        <DocumentTitle checkLayout={checkLayout} mockWindowWidth={mockWindowWidth} />
      </View>
      <View style={styles.rightContainer}>
        <DeleteButton onPress={() => dispatch(confirmationStateChanged({type: ConfirmationStateTypes.DELETE}))} />
        <SaveButton onPress={() => dispatch(saveDocument())} mockWindowWidth={mockWindowWidth} />
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
    <ButtonWithHoverColorAnimation onPress={toggle} offBgColorRGB={colors[700]} onBgColorRGB={colors.Orange} duration={0} style={styles.menuButton} childrenWrapperStyle={styles.menuButtonContents}>
      <SvgWrapper>
        {isOpen ? <CloseIcon /> : <HamburgerIcon />}
      </SvgWrapper>
    </ButtonWithHoverColorAnimation>
  )
}

const BORDER_BOTTOM_WIDTH_ANIM_DURATION = 200

const DocumentTitle = (props: {checkLayout?: boolean, mockWindowWidth?: number}) => {
  const {
    checkLayout,
    mockWindowWidth,
  } = props

  const {titleInput} = useAppSelector(selectSelectedDocumentOnEdit)
  const dispatch = useAppDispatch()
  // TODO: Needs tests
  const addExtension = () => {
    if (titleInput.replace(/\s*/, '') === '') {
      dispatch(updateTitleInput(env.NEW_DOCUMENT_TITLE))
      return
    }
    if (/\.md\s*$/.test(titleInput)) {
      dispatch(updateTitleInput(`${titleInput.replace(/^\s*/, '').replace(/\s*$/, '')}`))
      return
    }
    if (/\.m\s*$/.test(titleInput)) {
      dispatch(updateTitleInput(`${titleInput.replace(/^\s*/, '').replace(/\s*$/, '')}d`))
      return
    }
    if (/\.\s*$/.test(titleInput)) {
      dispatch(updateTitleInput(`${titleInput.replace(/^\s*/, '').replace(/\s*$/, '')}md`))
      return
    }
    dispatch(updateTitleInput(`${titleInput.replace(/^\s*/, '').replace(/\s*$/, '')}.md`))
  }

  const [onFocus, setOnFocus] = React.useState(false)
  React.useEffect(() => {
    onFocus ? focusAnim() : blurAnim()
  }, [onFocus])

  const mediaType = useMediaquery({width: mockWindowWidth})
  const {width: windowWidth} = useWindowDimensions({width: mockWindowWidth})
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
      <View style={[styles.textsContainer, checkLayout ? styles.textsContainerOutline : undefined]}>
        {mediaType !== MediaType.MOBILE && <Text style={[textStyles.bodyM, themeColors[colorScheme].documentTitleLabel]}>Document Name</Text>}
        <TextInput
          style={[styles.documentTitleInput, textStyles.headingM, {width: inputWidth}]}
          selectionColor={colors.Orange}
          value={titleInput}
          onChangeText={text => dispatch(updateTitleInput(text))}
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
    <ButtonWithHoverColorAnimation onPress={onPress} offBgColorRGB={colors[800]} onBgColorRGB={colors[700]} style={styles.deleteButton} childrenWrapperStyle={styles.deleteButtonContents} >
      <SvgWrapper>
        <DeleteIcon />
      </SvgWrapper>
    </ButtonWithHoverColorAnimation>
  )
}

const SaveButton = (props: {onPress: () => void, mockWindowWidth?: number}) => {
  const {
    onPress,
    mockWindowWidth,
  } = props

  const mediaType = useMediaquery({width: mockWindowWidth})

  return (
    <ButtonWithHoverColorAnimation
      onPress={onPress}
      offBgColorRGB={colors.Orange}
      onBgColorRGB={colors.OrangeHover}
      style={styles.saveButton}
      childrenWrapperStyle={styles.saveButtonContents}
    >
      <SvgWrapper>
        <SaveIcon />
      </SvgWrapper>
      {mediaType !== MediaType.MOBILE &&
        <Text style={[styles.saveButtonLabel, textStyles.headingM]}>
          Save Changes
        </Text>
      }
    </ButtonWithHoverColorAnimation>
  )
}

export default TopBar
