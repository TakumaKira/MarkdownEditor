import Constants from 'expo-constants'
import React from 'react'
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useHover } from 'react-native-web-hooks'
import useAnimatedColor from '../hooks/useAnimatedColor'
import { useAppSelector } from '../store/hooks'
import { selectColorScheme } from '../store/slices/theme'
import colors from '../theme/colors'
import textStyles from '../theme/textStyles'
import themeColors from '../theme/themeColors'
import Modal from './common/Modal'
import { Text } from './common/withCustomFont'

const styles = StyleSheet.create({
  modalContentContainer: {
    height: 218,
    width: 343,
    borderRadius: 4,
    paddingTop: 24,
    paddingBottom: 24,
    paddingLeft: 24,
    paddingRight: 24,
  },
  message: {
    marginTop: 16,
  },
  buttonContainer: {
    marginTop: 16,
    height: 40,
    backgroundColor: colors.Orange,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonLabel: {
    color: colors[100],
  },
})

const Confirmation = (props: {title: string, message: string, buttonLabel: string, onPressButton: () => void, onPressBackground: () => void}) => {
  const {
    title,
    message,
    buttonLabel,
    onPressButton,
    onPressBackground,
  } = props

  const colorScheme = useAppSelector(selectColorScheme)

  const ref = React.useRef(null)
  const isHovered = useHover(ref)
  const interpolatedBgColor = useAnimatedColor(isHovered, Constants.manifest?.extra?.BUTTON_COLOR_ANIM_DURATION, 'rgb(228, 102, 67)', 'rgb(243, 151, 101)')

  return (
    <Modal onPressBackground={onPressBackground}>
      <View style={[styles.modalContentContainer, themeColors[colorScheme].modalContentContainerBg]}>
        <Text style={[textStyles.previewH4, themeColors[colorScheme].confirmationTitle]}>{title}</Text>
        <Text style={[styles.message, textStyles.previewParagraph, themeColors[colorScheme].confirmationMessage]}>{message}</Text>
        <TouchableOpacity onPress={onPressButton} ref={ref}>
          <Animated.View style={[styles.buttonContainer, {backgroundColor: interpolatedBgColor}]}>
            <Text style={[styles.buttonLabel, textStyles.headingM]}>{buttonLabel}</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </Modal>
  )
}
export default Confirmation
