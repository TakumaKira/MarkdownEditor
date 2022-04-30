import { Dispatch, SetStateAction } from 'react'
import { Button, StyleSheet, Text, View } from 'react-native'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

const MainView = (props: {setShowSidebar: Dispatch<SetStateAction<boolean>>}) => {
  const {
    setShowSidebar,
  } = props

  return (
    <View style={styles.container}>
      <Button
        title="Sidebar Visibility Button"
        onPress={() => setShowSidebar(value => !value)}
      />
      <Text>Main</Text>
    </View>
  )
}

export default MainView
