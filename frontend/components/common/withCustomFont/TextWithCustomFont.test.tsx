import TextWithCustomFont from './TextWithCustomFont'

describe('TextWithCustomFont', () => {
  test('should display passed test', () => {
    const text = 'Test'
    expect((<TextWithCustomFont>{text}</TextWithCustomFont>).props.children).toBe(text)
  })
})
