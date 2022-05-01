import { Dispatch, SetStateAction } from 'react'
import { Button, StyleSheet, Text, View } from 'react-native'
import colors from '../theme/colors'

const styles = StyleSheet.create({
  container: {
    height: 72,
    backgroundColor: colors[900],
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
      <Text style={styles.text}>TopBar</Text>
      <Button
        title="Sidebar Visibility Button"
        onPress={() => setShowSidebar(value => !value)}
      />
    </View>
  )
}

export default TopBar
