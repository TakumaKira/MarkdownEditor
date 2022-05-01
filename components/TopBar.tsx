import { Dispatch, SetStateAction } from 'react'
import { Button, StyleSheet, View } from 'react-native'
import colors from '../theme/colors'
import textStyles from '../theme/textStyles'
import TextWithCustomFont from './TextWithCustomFont'

const styles = StyleSheet.create({
  container: {
    height: 72,
    backgroundColor: colors[800],
    flexDirection: 'row',
  },
  text: {
    color: colors[100],
  },
})

const TopBar = (props: {setShowSidebar: Dispatch<SetStateAction<boolean>>}) => {
  const {
    setShowSidebar,
  } = props
  return (
    <View style={styles.container}>
      <TextWithCustomFont style={[styles.text, textStyles.title]}>MARKDOWN</TextWithCustomFont>
      <Button
        title="Sidebar Visibility Button"
        onPress={() => setShowSidebar(value => !value)}
      />
    </View>
  )
}

export default TopBar
