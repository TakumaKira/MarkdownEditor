import { StyleProp, StyleSheet, TextStyle } from 'react-native'
import colors from '../theme/colors'
import textStyles from '../theme/textStyles'
import { Text } from './common/withCustomFont'

const styles = StyleSheet.create({
  text: {
    color: colors[100],
  },
})

const Title = (props: {style?: StyleProp<TextStyle>}) => {
  const {
    style,
  } = props
  return (
    <Text style={[styles.text, textStyles.title, style]}>MARKDOWN</Text>
  )
}

export default Title