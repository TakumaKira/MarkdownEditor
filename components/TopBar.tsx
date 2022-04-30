import { Dispatch, SetStateAction } from 'react'
import { Button, StyleSheet, Text, View } from 'react-native'

const styles = StyleSheet.create({
  container: {
    height: 72,
    backgroundColor: '#2B2D31',
    flexDirection: 'row',
  },
  text: {
    color: '#FFFFFF',
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
