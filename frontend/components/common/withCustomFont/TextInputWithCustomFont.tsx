import React from 'react'
import { TextInput, TextInputProps } from 'react-native'
import withCustomFont from './withCustomFont'

const TextInputWithCustomFont = (props: TextInputProps) => {
  const WithCustomFont = React.useMemo(() => withCustomFont(TextInput as unknown as React.ComponentFactory<TextInputProps, TextInput>), []) // TODO: Better type conversion

  return (
    <WithCustomFont {...props} />
  )
}
export default TextInputWithCustomFont
