import React from 'react'
import { Text, TextProps } from 'react-native'
import withCustomFont from './withCustomFont'

const TextWithCustomFont = (props: TextProps) => {
  const WithCustomFont = React.useMemo(() => withCustomFont(Text as unknown as React.ComponentFactory<TextProps, Text>), []) // TODO: Better type conversion

  return (
    <WithCustomFont {...props} />
  )
}
export default TextWithCustomFont
