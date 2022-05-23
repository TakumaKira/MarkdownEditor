import { Dispatch, SetStateAction } from 'react'
import { Button, StyleSheet, View } from 'react-native'
import colors from '../theme/colors'
import textStyles from '../theme/textStyles'
import { Text } from './common/withCustomFont'

export const TOP_BAR_HEIGHT = 72

const styles = StyleSheet.create({
  container: {
    height: TOP_BAR_HEIGHT,
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
      <Text style={[styles.text, textStyles.title]}>MARKDOWN</Text>
      <Button
        title="Sidebar Visibility Button"
        onPress={() => setShowSidebar(value => !value)}
      />
    </View>
  )
}

export default TopBar
