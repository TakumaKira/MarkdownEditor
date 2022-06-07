import React from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'
import { PreviewContext } from '../../contexts/previewContext'
import render from './markdown'

// TODO: Want a way to test if children doesn't do extra rendering.
const Preview = React.memo((props: {children: string, style?: StyleProp<ViewStyle>, viewerWidth?: number, disableImageEscapeOnMobile?: boolean}) => {
  const {
    children: input,
    style,
    viewerWidth,
    disableImageEscapeOnMobile,
  } = props

  return (
    <View style={style}>
      <PreviewContext.Provider value={{input, viewerWidth, disableImageEscapeOnMobile}}>
        {render(input)}
      </PreviewContext.Provider>
    </View>
  )
})

export default Preview