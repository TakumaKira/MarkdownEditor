import React from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'
import render from './markdown'

// TODO: Want a way to test if children doesn't do extra rendering.
const Preview = React.memo((props: {children: string, style: StyleProp<ViewStyle>}) => {
  return (
    <View style={props.style}>
      {render(props.children)}
    </View>
  )
})

export default Preview