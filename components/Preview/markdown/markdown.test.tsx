import { fireEvent, render, waitFor } from '@testing-library/react-native'
import * as WebBrowser from 'expo-web-browser'
import textStyles from '../../../theme/textStyles'
import Markdown, { Bold, Default, Inline, InlineCode, Italic, Link } from './markdown'

describe('Markdown.splitByMarkdown', () => {
  test('return array of string or FoundMarkdown without any valid inline markdown', () => {
    const originalLine = 'this is `inline code` and click [this link](https://link.com) and this is `inline code`[this link](https://link.com)'
    const expectedResult = [
      new Default('this is '),
      new InlineCode('`inline code`'),
      new Default(' and click '),
      new Link('[this link](https://link.com)'),
      new Default(' and this is '),
      new InlineCode('`inline code`'),
      new Link('[this link](https://link.com)'),
    ]
    const result = Markdown.splitByMarkdown(originalLine)
    result.forEach((r, i) => expect(r.is(expectedResult[i])).toBe(true))
  })
})

describe('Markdown.findInlineMarkdown', () => {
  test('find inline code', () => {
    const contentCode = '`inline code`'
    const resultCode = Markdown.findInlineMarkdown('this is `inline code` and...')
    expect(resultCode)
      .toEqual({index: 8, InlineMarkdownClass: InlineCode, content: contentCode})
  })
  test('find link', () => {
    const contentLink = '[this link](https://link.com)'
    const resultLink = Markdown.findInlineMarkdown('click [this link](https://link.com)')
    expect(resultLink)
      .toEqual({index: 6, InlineMarkdownClass: Link, content: contentLink})
  })
  test('return the one with youngest index when the line has multiple type of markdowns', () => {
    const contentCode = '`inline code`'
    const resultCode = Markdown.findInlineMarkdown('this is `inline code` and click [this link](https://link.com)')
    expect(resultCode)
      .toEqual({index: 8, InlineMarkdownClass: InlineCode, content: contentCode})

    const contentLink = '[this link](https://link.com)'
    const resultLink = Markdown.findInlineMarkdown('click [this link](https://link.com) and this is `inline code`')
    expect(resultLink)
      .toEqual({index: 6, InlineMarkdownClass: Link, content: contentLink})
  })
  test('return the one with shortest length when it has multiple candidates for its closing', () => {
    const contentCode = '`inline code`'
    const resultCode = Markdown.findInlineMarkdown('this is `inline code` and this is `inline code`')
    expect(resultCode)
      .toEqual({index: 8, InlineMarkdownClass: InlineCode, content: contentCode})

    const contentLink = '[this link](https://link.com)'
    const resultLink = Markdown.findInlineMarkdown('click [this link](https://link.com) and click [this link](https://link.com)')
    expect(resultLink)
      .toEqual({index: 6, InlineMarkdownClass: Link, content: contentLink})
  })
})

describe('InlineCode', () => {
  test('InlineCode.regexp should return "`t`" if it tested with "`t``"', () => {
    expect(InlineCode.regexp.exec('`t``')?.[0]).toBe('`t`')
  })
})

describe('Bold', () => {
  test('Bold.regexp should return "**t**" if it tested with "**t***"', () => {
    expect(Bold.regexp.exec('**t***')?.[0]).toBe('**t**')
  })
})

describe('Italic', () => {
  test('Italic.regexp should return "*t*" if it tested with "*t**"', () => {
    expect(Italic.regexp.exec('*t**')?.[0]).toBe('*t*')
  })
})

describe('Inline.Code', () => {
  test('render text correctly', async() => {
    const text = 'text'
    const result = render(<Inline.Code>{"`" + text + "`"}</Inline.Code>)
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
    const result = render(<Inline.Link>{"[" + text + "](" + url + ")"}</Inline.Link>)
    await waitFor(() => result.getByText(text))
    const snapshot = result.toJSON()
    expect(snapshot.children[0].children[0].children[0]).toEqual(text)
    expect(snapshot.props.style).toEqual(textStyles.link)
  })
  test('link works correctly', async() => {
    const mockOpenBrowserAsync = jest.spyOn(WebBrowser, 'openBrowserAsync')
    mockOpenBrowserAsync.mockImplementation(() => new Promise(() => {}))
    const text = 'text'
    const url = 'https://test.com'
    const result = render(<Inline.Link>{"[" + text + "](" + url + ")"}</Inline.Link>)
    await waitFor(() => result.getByText(text))
    fireEvent.press(result.getByText(text))
    expect(mockOpenBrowserAsync).toBeCalledWith(url)
  })
})
