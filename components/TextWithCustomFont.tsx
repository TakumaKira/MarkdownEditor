import React from 'react'
import { Text, TextProps } from 'react-native'
import withCustomFont from './withCustomFont'

const TextWithCustomFont = (props: TextProps) => {
  const WithCustomFont = withCustomFont(Text)

  const {
    children,
    ...rest
  } = props

  return (
    <WithCustomFont {...rest}>{children}</WithCustomFont>
  )
}

export default TextWithCustomFont