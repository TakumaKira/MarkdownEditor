import { StyleSheet, Text, View } from 'react-native'

export const SIDEBAR_WIDTH = 250

const styles = StyleSheet.create({
  container: {
    width: SIDEBAR_WIDTH,
    height: '100%',
    backgroundColor: '#1D1F22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
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
