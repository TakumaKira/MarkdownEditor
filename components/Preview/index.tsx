import React from 'react'
import { View } from 'react-native'
import render from './classes'

const Preview = (props: {children: string}) => {
  return (
    <View>
      {render(props.children)}
    </View>
  )
}

export default Preview