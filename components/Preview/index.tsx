import React from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'
import { PreviewContext } from '../../contexts/previewContext'
import render from './markdown'

// TODO: Want a way to test if children doesn't do extra rendering.
const Preview = React.memo((props: {children: string, style: StyleProp<ViewStyle>, viewerWidth: number}) => {
  const {viewerWidth} = props
  return (
    <View style={props.style}>
      <PreviewContext.Provider value={{viewerWidth}}>
        {render(props.children)}
      </PreviewContext.Provider>
    </View>
  )
})

export default Preview