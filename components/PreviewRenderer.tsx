import React from 'react'
import { View } from 'react-native'
import { blockLines } from '../helpers/processLines'
import renderLine from '../helpers/renderLines'

const PreviewRenderer = (props: {input: string}) => {
  const {
    input,
  } = props
  return (
    <View>
      {blockLines(input.split('\n')).map((line, i) =>
        <React.Fragment key={i}>{renderLine(line)}</React.Fragment>
      )}
    </View>
  )
}

export default PreviewRenderer