import TextInputWithCustomFont from './TextInputWithCustomFont'

describe('TextInputWithCustomFont', () => {
  test('should display passed test', () => {
    const text = 'Test'
    expect((<TextInputWithCustomFont value={text} />).props.value).toBe(text)
  })
})
