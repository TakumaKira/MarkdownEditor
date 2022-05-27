import { StyleSheet, TouchableOpacity, View } from 'react-native'
import colors from '../theme/colors'
import textStyles from '../theme/textStyles'
import Modal from './common/Modal'
import { Text } from './common/withCustomFont'

const styles = StyleSheet.create({
  modalContentContainer: {
    height: 218,
    width: 343,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    paddingTop: 24,
    paddingBottom: 24,
    paddingLeft: 24,
    paddingRight: 24,
  },
  title: {
    color: colors[700],
  },
  message: {
    marginTop: 16,
    color: colors[500],
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

  return (
    <Modal onPressBackground={onPressBackground}>
      <View style={styles.modalContentContainer}>
        <Text style={[styles.title, textStyles.previewH4]}>{title}</Text>
        <Text style={[styles.message, textStyles.previewParagraph]}>{message}</Text>
        <TouchableOpacity style={styles.buttonContainer} onPress={onPressButton}>
          <Text style={[styles.buttonLabel, textStyles.headingM]}>{buttonLabel}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  )
}

export default Confirmation