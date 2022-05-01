import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import colors from '../theme/colors'
import textStyles from '../theme/textStyles'
import TextWithCustomFont from './TextWithCustomFont'

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
      <TextWithCustomFont style={[styles.text, textStyles.headingM]}>SideBar</TextWithCustomFont>
      <TextWithCustomFont style={[styles.text, textStyles.headingM]}>Menu</TextWithCustomFont>
    </View>
  )
}

export default SideBar
