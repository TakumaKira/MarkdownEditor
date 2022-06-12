import React from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'
import { PreviewContext } from '../../contexts/previewContext'
import render from './markdown'

// TODO: Want a way to test if children doesn't do extra rendering.
const Preview = React.memo((props: {children: string, style?: StyleProp<ViewStyle>, disableImageEscapeOnMobile?: boolean}) => {
  const {
    children: input,
    style,
    disableImageEscapeOnMobile,
  } = props

  const [viewerWidth, setViewerWidth] = React.useState<number>()

  return (
    <View style={style}>
      <View onLayout={e => setViewerWidth(e.nativeEvent.layout.width)}>
        <PreviewContext.Provider value={{input, viewerWidth, disableImageEscapeOnMobile}}>
          {render(input)}
        </PreviewContext.Provider>
      </View>
    </View>
  )
})

export default Preview