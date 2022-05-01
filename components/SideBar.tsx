import { StyleSheet, Text, View } from 'react-native'
import colors from '../theme/colors'

export const SIDEBAR_WIDTH = 250

const styles = StyleSheet.create({
  container: {
    width: SIDEBAR_WIDTH,
    flex: 1,
    backgroundColor: colors[900],
  },
  text: {
    color: colors[100],
  },
})

const SideBar = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Sidebar</Text>
      <Text style={styles.text}>Menu</Text>
    </View>
  )
}

export default SideBar
