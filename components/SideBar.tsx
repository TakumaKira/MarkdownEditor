import React from 'react'
import { Animated, ScrollView, StyleProp, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View, ViewStyle } from 'react-native'
import DarkIconHighlight from '../assets/icon-dark-mode-highlight.svg'
import DarkIcon from '../assets/icon-dark-mode.svg'
import DocumentIcon from '../assets/icon-document.svg'
import LightIconHighlight from '../assets/icon-light-mode-highlight.svg'
import LightIcon from '../assets/icon-light-mode.svg'
import { ConfirmationState, useInputContext } from '../contexts/inputContext'
import { sortDocumentsFromNewest } from '../helpers/functions'
import useMediaquery, { MediaType } from '../hooks/useMediaquery'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { newDocument, selectDocument } from '../store/slices/document'
import { toggleTheme } from '../store/slices/theme'
import colors from '../theme/colors'
import textStyles from '../theme/textStyles'
import ButtonWithHoverColorAnimation from './common/ButtonWithHoverColorAnimation'
import SvgWrapper from './common/SvgWrapper'
import { Text } from './common/withCustomFont'
import Title from './Title'

export const SIDEBAR_WIDTH = 250

const styles = StyleSheet.create({
  container: {
    width: SIDEBAR_WIDTH,
    flex: 1,
    backgroundColor: colors[900],
    paddingLeft: 24,
    paddingRight: 24,
  },
  title: {
    marginTop: 27,
  },
  myDocuments: {
    color: colors[500],
    marginTop: 27,
  },
  addButton: {
    marginTop: 29,
    height: 40,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonLabel: {
    color: colors[100],
  },
  documentCardsContainer: {
    marginTop: 24,
    marginBottom: 24,
  },
  notFirstDocumentCard: {
    marginTop: 26,
  },
  documentCardContainer: {
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

const SideBar = () => {
  const mediaType = useMediaquery()
  const documentList = useAppSelector(state => state.document.documentList)
  const dispatch = useAppDispatch()
  const {setConfirmationState} = useInputContext()
  const {hasEdit} = useInputContext()

  const handlePressDocument = (id: string) => {
    if (hasEdit) {
      setConfirmationState({state: ConfirmationState.LEAVE_UNSAVED_DOCUMENT, nextId: id})
    } else {
      dispatch(selectDocument(id))
    }
  }

  return (
    <View style={styles.container}>
      {mediaType !== MediaType.DESKTOP && <Title style={styles.title} />}
      <Text style={[styles.myDocuments, textStyles.headingS]}>MY DOCUMENTS</Text>
      <AddButton onPress={() => dispatch(newDocument())} />
      <ScrollView style={styles.documentCardsContainer}>
        {sortDocumentsFromNewest(documentList).map(({lastUpdatedAt, name, id}, i) =>
          <DocumentCard
            key={id}
            lastUpdatedAt={lastUpdatedAt}
            name={name}
            style={i === 0 ? undefined : styles.notFirstDocumentCard}
            onPress={() => handlePressDocument(id)}
          />
        )}
      </ScrollView>
      <ThemeToggle />
    </View>
  )
}

const AddButton = (props: {onPress: () => void}) => {
  const {
    onPress,
  } = props

  return (
    <ButtonWithHoverColorAnimation onPress={onPress} offBgColorRGB={colors.Orange} onBgColorRGB={colors.OrangeHover} style={styles.addButton}>
      <Text style={[styles.addButtonLabel, textStyles.headingM]}>+ New Document</Text>
    </ButtonWithHoverColorAnimation>
  )
}

const DocumentCard = (props: {lastUpdatedAt: string, name: string, style?: StyleProp<ViewStyle>, onPress: () => void}) => {
  const {
    lastUpdatedAt,
    name,
    style,
    onPress,
  } = props

  return (
    <TouchableOpacity style={[styles.documentCardContainer, style]} onPress={onPress}>
      <View style={styles.documentIcon}>
        <SvgWrapper>
          <DocumentIcon />
        </SvgWrapper>
      </View>
      <View style={styles.documentCardTextsContainer}>
        <Text style={[styles.lastUpdatedAtLabel, textStyles.bodyM]}>{formatDate(lastUpdatedAt)}</Text>
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
