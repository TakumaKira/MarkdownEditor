import React from 'react'
import { StyleSheet, View } from 'react-native'
import colors from '../theme/colors'
import textStyles from '../theme/textStyles'
import { Text } from './common/withCustomFont'

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
      <Text style={[styles.text, textStyles.headingM]}>SideBar</Text>
      <Text style={[styles.text, textStyles.headingM]}>Menu</Text>
    </View>
  )
}

export default SideBar
