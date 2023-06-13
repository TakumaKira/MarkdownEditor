import React from 'react'
import { StyleSheet, View } from 'react-native'
import { useAppSelector } from '../../store/hooks'
import { selectColorScheme } from '../../store/slices/theme'
import colors from '../../theme/colors'
import textStyles from '../../theme/textStyles'
import themeColors from '../../theme/themeColors'
import ButtonWithHoverColorAnimation from '../common/ButtonWithHoverColorAnimation'
import Modal from '../common/Modal'
import { Text } from '../common/withCustomFont'

const styles = StyleSheet.create({
  modalContentContainer: {
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
  button: {
    marginTop: 16,
    height: 40,
    borderRadius: 4,
  },
  buttonContents: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonLabel: {
    color: colors[100],
  },
})

const MessageModalBase = ({
  title,
  message,
  buttonLabel,
  onPressButton,
  onPressBackground,
}: {
  title: string
  message: string
  buttonLabel: string
  onPressButton: () => void
  onPressBackground: () => void
}) => {
  const colorScheme = useAppSelector(selectColorScheme)

  return (
    <Modal onPressBackground={onPressBackground}>
      <View style={[styles.modalContentContainer, themeColors[colorScheme].modalContentContainerBg]}>
        <Text style={[textStyles.previewH4, themeColors[colorScheme].confirmationTitle]}>
          {title}
        </Text>
        <Text style={[styles.message, textStyles.previewParagraph, themeColors[colorScheme].confirmationMessage]}>
          {message}
        </Text>
        <ButtonWithHoverColorAnimation
          onPress={onPressButton}
          offBgColorRGB={colors.Orange}
          onBgColorRGB={colors.OrangeHover}
          style={styles.button}
          childrenWrapperStyle={styles.buttonContents}
        >
          <Text style={[styles.buttonLabel, textStyles.headingM]}>
            {buttonLabel}
          </Text>
        </ButtonWithHoverColorAnimation>
      </View>
    </Modal>
  )
}
export default MessageModalBase
