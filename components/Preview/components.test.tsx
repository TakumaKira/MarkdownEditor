import { fireEvent, render, waitFor } from '@testing-library/react-native'
import * as WebBrowser from 'expo-web-browser'
import textStyles from "../../theme/textStyles"
import { Inline } from './components'

describe('Inline.Code', () => {
  test('render text correctly', async() => {
    const text = 'text'
    const result = render(<Inline.Code>{text}</Inline.Code>)
    await waitFor(() => result.getByText(text))
    const snapshot = result.toJSON()
    expect(snapshot.children).toEqual([text])
    expect(snapshot.props.style).toEqual(textStyles.markdownCode)
  })
})

describe('Inline.Link', () => {
  beforeEach(() => {
    jest.spyOn(WebBrowser, 'openBrowserAsync')
  })

  test('render text correctly', async() => {
    const text = 'text'
    const url = 'https://test.com'
    const result = render(<Inline.Link url={url}>{text}</Inline.Link>)
    await waitFor(() => result.getByText(text))
    const snapshot = result.toJSON()
    expect(snapshot.children).toEqual([text])
    expect(snapshot.props.style).toEqual(textStyles.link)
  })
  test('link works correctly', async() => {
    const mockOpenBrowserAsync = jest.spyOn(WebBrowser, 'openBrowserAsync')
    mockOpenBrowserAsync.mockImplementation(() => new Promise(() => {}))
    const text = 'text'
    const url = 'https://test.com'
    const result = render(<Inline.Link url={url}>{text}</Inline.Link>)
    await waitFor(() => result.getByText(text))
    fireEvent.press(result.getByText(text))
    expect(mockOpenBrowserAsync).toBeCalledWith(url)
  })
})
