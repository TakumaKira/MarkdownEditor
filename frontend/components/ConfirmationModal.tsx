import React from 'react'
import { StyleSheet, View } from 'react-native'
import { confirmationMessages, ConfirmationStateTypes } from '../constants/confirmationMessages'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { ConfirmationState, ConfirmationStateWithNextId } from '../store/models/document'
import { confirmationStateChanged, deleteSelectedDocument, selectDocument, selectSelectedDocumentOnEdit } from '../store/slices/document'
import { selectColorScheme } from '../store/slices/theme'
import colors from '../theme/colors'
import textStyles from '../theme/textStyles'
import themeColors from '../theme/themeColors'
import ButtonWithHoverColorAnimation from './common/ButtonWithHoverColorAnimation'
import Modal from './common/Modal'
import { Text } from './common/withCustomFont'

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

const ConfirmationModal = (props: {
  confirmationState: ConfirmationState | ConfirmationStateWithNextId
}) => {
  const {confirmationState} = props

  const colorScheme = useAppSelector(selectColorScheme)

  const dispatch = useAppDispatch()

  const {title, getMessage, buttonLabel} = confirmationMessages[confirmationState.type]
  const {titleInput} = useAppSelector(selectSelectedDocumentOnEdit)
  const message = getMessage(titleInput)

  const handleConfirm = () => {
    if (confirmationState.type === ConfirmationStateTypes.DELETE) {
      dispatch(deleteSelectedDocument())
    } else if (confirmationState.type === ConfirmationStateTypes.LEAVE_UNSAVED_DOCUMENT) {
      dispatch(selectDocument((confirmationState as ConfirmationStateWithNextId).nextId))
    }
    dispatch(confirmationStateChanged(null))
  }
  const handleCancel = () => {
    dispatch(confirmationStateChanged(null))
  }

  return (
    <Modal onPressBackground={handleCancel}>
      <View style={[styles.modalContentContainer, themeColors[colorScheme].modalContentContainerBg]}>
        <Text style={[textStyles.previewH4, themeColors[colorScheme].confirmationTitle]}>{title}</Text>
        <Text style={[styles.message, textStyles.previewParagraph, themeColors[colorScheme].confirmationMessage]}>{message}</Text>
        <ButtonWithHoverColorAnimation
          onPress={handleConfirm}
          offBgColorRGB={colors.Orange}
          onBgColorRGB={colors.OrangeHover}
          style={styles.button}
          childrenWrapperStyle={styles.buttonContents}
        >
          <Text style={[styles.buttonLabel, textStyles.headingM]}>{buttonLabel}</Text>
        </ButtonWithHoverColorAnimation>
      </View>
    </Modal>
  )
}
export default ConfirmationModal
