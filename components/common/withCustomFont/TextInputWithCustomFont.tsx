import React from 'react'
import { TextInput, TextInputProps } from 'react-native'
import withCustomFont from './withCustomFont'

const TextInputWithCustomFont = (props: TextInputProps) => {
  const WithCustomFont = withCustomFont(TextInput)

  return (
    <WithCustomFont {...props} />
  )
}

export default TextInputWithCustomFont