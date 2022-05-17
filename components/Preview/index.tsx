import React from 'react'
import { View } from 'react-native'
import render from './markdown'

// TODO: Want a way to test if children doesn't do extra rendering.
const Preview = React.memo((props: {children: string}) => {
  return (
    <View>
      {render(props.children)}
    </View>
  )
})

export default Preview