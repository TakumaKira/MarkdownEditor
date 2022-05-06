import React from 'react'
import { StyleProp, TextStyle } from 'react-native'
import { splitByMarkdown } from '../helpers/processLine'
import TextWithCustomFont from './TextWithCustomFont'

const LineRenderer = (props: {children: string, style?: StyleProp<TextStyle>}) => {
  const {
    children,
    style,
  } = props
  return (
    <TextWithCustomFont style={style}>
      {splitByMarkdown(children).map((part, i) => {
        if (typeof part === 'string') {
          return part
        }
        return <React.Fragment key={i}>{part.renderFragment()}</React.Fragment>
      })}
    </TextWithCustomFont>
  )
}

export default LineRenderer