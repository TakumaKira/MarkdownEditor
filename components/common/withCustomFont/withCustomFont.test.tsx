import { Text, TextInput, TextInputProps, TextProps } from 'react-native'
import withCustomFont from "./withCustomFont"

describe('withCustomFont', () => {
  test('should return passed Text component', () => {
    const WithCustomFont = withCustomFont(Text as unknown as React.ComponentFactory<TextProps, Text>)
    const text = 'Test'
    expect((<WithCustomFont>{text}</WithCustomFont>).props.children).toBe(text)
  })
  test('should return passed TextInput component', () => {
    const WithCustomFont = withCustomFont(TextInput as unknown as React.ComponentFactory<TextInputProps, TextInput>)
    const text = 'Test'
    expect((<WithCustomFont value={text} />).props.value).toBe(text)
  })
})
