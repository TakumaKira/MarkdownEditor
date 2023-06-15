import React from 'react'
import { Animated, ScrollView, StyleProp, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View, ViewStyle } from 'react-native'
import DarkIconHighlight from '../assets/icon-dark-mode-highlight.svg'
import DarkIcon from '../assets/icon-dark-mode.svg'
import DocumentIcon from '../assets/icon-document.svg'
import LightIconHighlight from '../assets/icon-light-mode-highlight.svg'
import LightIcon from '../assets/icon-light-mode.svg'
import { sortDocumentsFromNewest } from '../helpers/sortDocuments'
import useMediaquery, { MediaType } from '../hooks/useMediaquery'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { documentConfirmationStateChanged, newDocument, selectDocument, selectLiveDocumentList, selectSelectedDocumentHasEdit, selectSelectedDocumentOnEdit } from '../store/slices/document'
import { toggleTheme } from '../store/slices/theme'
import { AuthStateTypes, callAuthModal, submitLogout } from '../store/slices/user'
import colors from '../theme/colors'
import fonts from '../theme/fonts'
import textStyles from '../theme/textStyles'
import ButtonWithHoverColorAnimation from './common/ButtonWithHoverColorAnimation'
import SvgWrapper from './common/SvgWrapper'
import { Text } from './common/withCustomFont'
import Title from './Title'
import DocumentConfirmationStateTypes from '../types/DocumentConfirmationStateTypes'

export const SIDEBAR_WIDTH = 250

const styles = StyleSheet.create({
  container: {
    width: SIDEBAR_WIDTH,
    flex: 1,
    backgroundColor: colors[900],
    paddingHorizontal: 16,
  },
  title: {
    marginTop: 27,
    marginHorizontal: 8,
  },
  myDocuments: {
    color: colors[500],
    marginTop: 27,
    marginHorizontal: 8,
  },
  addButton: {
    marginTop: 29,
    marginHorizontal: 8,
    height: 40,
    borderRadius: 4,
  },
  addButtonContents: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonLabel: {
    color: colors[100],
  },
  documentCardsContainer: {
    marginVertical: 17,
  },
  documentCardContainerSelected: {
    backgroundColor: colors[800],
    borderRadius: 4,
  },
  notFirstDocumentCard: {
    marginTop: 12,
  },
  documentCardContainer: {
    paddingVertical: 7,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  documentIcon: {
    top: 10,
  },
  documentCardTextsContainer: {
    marginLeft: 16,
  },
  lastUpdatedAtLabel: {
    color: colors[500],
  },
  nameLabel: {
    marginTop: 3,
    color: colors[100],
    width: 170,
  },
  twoButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  buttonsGap: {
    width: 18,
  },
  authContainerLoggedIn: {
    marginBottom: 24,
    marginHorizontal: 8,
  },
  loggedInAs: {
    color: colors[400],
    marginBottom: 6,
  },
  userEmail: {
    textAlign: 'center',
    marginBottom: 18,
    fontFamily: fonts.robotoRegular,
    fontSize: 14,
    color: colors[400],
  },
  authButton: {
    flexGrow: 1,
    height: 35,
    borderRadius: 4,
  },
  twoButtons: {
    flexBasis: 0,
  },
  authButtonContents: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  authButtonLabel: {
    color: colors[100],
  },
  themeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  toggleSwitch: {
    width: 48,
    height: 24,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: colors[600],
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleSlider: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors[100],
  },
})

const SideBar = (props: {
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const {
    setShowSidebar,
  } = props

  const dispatch = useAppDispatch()
  const documentList = useAppSelector(selectLiveDocumentList)
  const selectedDocumentOnEditId = useAppSelector(selectSelectedDocumentOnEdit).id
  const hasEdit = useAppSelector(selectSelectedDocumentHasEdit)
  const mediaType = useMediaquery()

  const handlePressAddButton = () => {
    dispatch(newDocument())
    setShowSidebar(false)
  }

  const handlePressDocument = (id: string) => {
    if (hasEdit) {
      dispatch(documentConfirmationStateChanged({type: DocumentConfirmationStateTypes.LEAVE_UNSAVED_DOCUMENT, nextId: id}))
    } else {
      dispatch(selectDocument(id))
    }
  }

  return (
    <View style={styles.container}>
      {mediaType !== MediaType.DESKTOP && <Title style={styles.title} />}
      <Text style={[styles.myDocuments, textStyles.headingS]}>MY DOCUMENTS</Text>
      <AddButton onPress={handlePressAddButton} />
      <ScrollView style={styles.documentCardsContainer} testID="sidebar-documents-list">
        {sortDocumentsFromNewest(documentList).map(({updatedAt, name, id}, i) =>
          <DocumentCard
            key={id}
            updatedAt={updatedAt}
            name={name ?? ''}
            style={i === 0 ? undefined : styles.notFirstDocumentCard}
            onPress={() => handlePressDocument(id)}
            isSelected={id === selectedDocumentOnEditId}
          />
        )}
      </ScrollView>
      <Auth />
      <ThemeToggle />
    </View>
  )
}

const AddButton = (props: {onPress: () => void}) => {
  const {
    onPress,
  } = props

  return (
    <ButtonWithHoverColorAnimation onPress={onPress} offBgColorRGB={colors.Orange} onBgColorRGB={colors.OrangeHover} style={styles.addButton} childrenWrapperStyle={styles.addButtonContents} >
      <Text style={[styles.addButtonLabel, textStyles.headingM]}>+ New Document</Text>
    </ButtonWithHoverColorAnimation>
  )
}

const DocumentCard = (props: {updatedAt: string, name: string, style?: StyleProp<ViewStyle>, onPress: () => void, isSelected: boolean}) => {
  const {
    updatedAt,
    name,
    style,
    onPress,
    isSelected,
  } = props

  return (
    <TouchableOpacity style={[styles.documentCardContainer, isSelected ? styles.documentCardContainerSelected : undefined, style]} onPress={onPress}>
      <View style={styles.documentIcon}>
        <SvgWrapper>
          <DocumentIcon />
        </SvgWrapper>
      </View>
      <View style={styles.documentCardTextsContainer}>
        <Text style={[styles.lastUpdatedAtLabel, textStyles.bodyM]}>{formatDate(updatedAt)}</Text>
        <Text style={[styles.nameLabel, textStyles.headingM]}>{name}</Text>
      </View>
    </TouchableOpacity>
  )
}

/** Format date string from "2022-04-01T00:00:00.000Z" to "01 April 2022" */
const formatDate = (dateStr: string): string => {
  try {
    const [yearStr, monthStr, dayStr] = dateStr.split('T')[0].split('-')
    const months: Record<string, string> = {
      '01': 'January', '02': 'February', '03': 'March', '04': 'April', '05': 'May', '06': 'June', '07': 'July', '08': 'August', '09': 'September', '10': 'October', '11': 'November', '12': 'December'
    } as const
    return `${dayStr} ${months[monthStr]} ${yearStr}`
  } catch {
    return dateStr
  }
}

const Auth = () => {
  const userEmail = useAppSelector(state => state.user.email)
  const dispatch = useAppDispatch()

  return (userEmail === null
    ? <View style={styles.twoButtonsContainer}>
      <ButtonWithHoverColorAnimation
        onPress={() => dispatch(callAuthModal({authStateType: AuthStateTypes.SIGNUP}))}
        offBgColorRGB={colors.Orange}
        onBgColorRGB={colors.OrangeHover}
        style={[styles.authButton, styles.twoButtons]}
        childrenWrapperStyle={styles.authButtonContents}
        testID="sidebar-signup-button"
      >
        <Text style={[styles.authButtonLabel]}>Signup</Text>
      </ButtonWithHoverColorAnimation>
      <View style={styles.buttonsGap} />
      <ButtonWithHoverColorAnimation
        onPress={() => dispatch(callAuthModal({authStateType: AuthStateTypes.LOGIN}))}
        offBgColorRGB={colors.Orange}
        onBgColorRGB={colors.OrangeHover}
        style={[styles.authButton, styles.twoButtons]}
        childrenWrapperStyle={styles.authButtonContents}
        testID="sidebar-login-button"
      >
        <Text style={[styles.authButtonLabel]}>Login</Text>
      </ButtonWithHoverColorAnimation>
    </View>
    : <View style={styles.authContainerLoggedIn}>
      <Text style={[textStyles.bodyM, styles.loggedInAs]}>Logged in as</Text>
      <Text style={styles.userEmail}>{userEmail}</Text>
      <View style={styles.twoButtonsContainer}>
        <ButtonWithHoverColorAnimation
          onPress={() => dispatch(callAuthModal({authStateType: AuthStateTypes.EDIT}))}
          offBgColorRGB={colors.Orange}
          onBgColorRGB={colors.OrangeHover}
          style={[styles.authButton, styles.twoButtons]}
          childrenWrapperStyle={styles.authButtonContents}
          testID="sidebar-edit-button"
        >
          <Text style={[styles.authButtonLabel]}>Edit</Text>
        </ButtonWithHoverColorAnimation>
        <View style={styles.buttonsGap} />
        <ButtonWithHoverColorAnimation
          onPress={() => dispatch(callAuthModal({authStateType: AuthStateTypes.DELETE}))}
          offBgColorRGB={colors.Red}
          onBgColorRGB={colors.RedHover}
          style={[styles.authButton, styles.twoButtons]}
          childrenWrapperStyle={styles.authButtonContents}
          testID="sidebar-delete-button"
        >
          <Text style={[styles.authButtonLabel]}>Delete</Text>
        </ButtonWithHoverColorAnimation>
      </View>
      <ButtonWithHoverColorAnimation
        onPress={() => dispatch(submitLogout())}
        offBgColorRGB={colors.Orange}
        onBgColorRGB={colors.OrangeHover}
        style={[styles.authButton]}
        childrenWrapperStyle={styles.authButtonContents}
        testID="sidebar-logout-button"
      >
        <Text style={[styles.authButtonLabel]}>
          Logout
        </Text>
      </ButtonWithHoverColorAnimation>
    </View>
  )
}

const ThemeToggle = () => {
  const isDark = useAppSelector(state => state.theme.selectedColorSchemeIsDark)
  const dispatch = useAppDispatch()
  const toggleIsDark = () => dispatch(toggleTheme())

  return (
    <View style={styles.themeToggleContainer}>
      <SvgWrapper>
       {isDark ? <DarkIconHighlight /> : <DarkIcon />}
      </SvgWrapper>
      <ToggleSwitch initialIsLeft={isDark ?? false} isLeft={isDark ?? false} toggleIsLeft={toggleIsDark} />
      <SvgWrapper>
        {isDark ? <LightIcon /> : <LightIconHighlight />}
      </SvgWrapper>
    </View>
  )
}

const TOGGLE_SWITCH_ANIM_DURATION = 200
const IS_LEFT_MARGIN_LEFT = 6
const IS_RIGHT_MARGIN_LEFT = 30

const ToggleSwitch = (props: {initialIsLeft: boolean, isLeft: boolean, toggleIsLeft: () => void}) => {
  const {
    initialIsLeft,
    isLeft,
    toggleIsLeft,
  } = props

  const marginLeftAnim = React.useRef(new Animated.Value(initialIsLeft ? IS_LEFT_MARGIN_LEFT : IS_RIGHT_MARGIN_LEFT)).current

  React.useEffect(() => {
    isLeft ? toLeftAnim() : toRightAnim()
  }, [isLeft])

  const toLeftAnim = () => {
    Animated.timing(marginLeftAnim, {
      toValue: IS_LEFT_MARGIN_LEFT,
      duration: TOGGLE_SWITCH_ANIM_DURATION,
      useNativeDriver: false
    }).start()
  }
  const toRightAnim = () => {
    Animated.timing(marginLeftAnim, {
      toValue: IS_RIGHT_MARGIN_LEFT,
      duration: TOGGLE_SWITCH_ANIM_DURATION,
      useNativeDriver: false
    }).start()
  }

  return (
    <TouchableWithoutFeedback onPress={() => toggleIsLeft()}>
      <View style={styles.toggleSwitch}>
        <Animated.View style={[styles.toggleSlider, {marginLeft: marginLeftAnim}]} />
      </View>
    </TouchableWithoutFeedback>
  )
}

export default SideBar
