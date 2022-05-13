import { fireEvent, render, waitFor } from '@testing-library/react-native'
import * as WebBrowser from 'expo-web-browser'
import textStyles from '../../../theme/textStyles'
import Markdown, { Bold, Default, Inline, InlineCode, Italic, Link } from './markdown'
import MultilineBlock, { BlockCode } from './multilineBlock'

describe('MultilineBlock', () => {
  test('MultilineBlock.find() returns intended result', () => {
    const originalLines: string[] = [
      'line 1',
      '```',
      'line 3',
      'line 4',
      '```',
      'line 6',
      '```',
      'line 8',
    ]
    const expectedResult: (string | MultilineBlock)[] = [
      'line 1',
      new BlockCode([
        'line 3',
        'line 4',
      ]),
      'line 6',
      '```',
      'line 8',
    ]
    expect(MultilineBlock.find(originalLines)).toEqual(expectedResult)
  })
  test('returns empty array if passed empty array', () => {
    expect(MultilineBlock.find([])).toEqual([])
  })
  test('supports empty block', () => {
    expect(MultilineBlock.find(['```', '```'])).toEqual([new BlockCode([])])
  })
})
describe('Markdown.splitByMarkdown', () => {
  test('return array of string or FoundMarkdown without any valid inline markdown', () => {
    expect(Markdown.splitByMarkdown('this is `inline code` and click [this link](https://link.com) and this is `inline code`[this link](https://link.com)'))
      .toEqual([
        new Default('this is '),
        new InlineCode('`inline code`'),
        new Default(' and click '),
        new Link('[this link](https://link.com)'),
        new Default(' and this is '),
        new InlineCode('`inline code`'),
        new Link('[this link](https://link.com)'),
      ])
  })
})

describe('Markdown.findInlineMarkdown', () => {
  test('find inline code', () => {
    const contentText = 'inline code'
    const contentCode = '`inline code`'
    const resultCode = Markdown.findInlineMarkdown('this is `inline code` and...')
    expect(resultCode)
      .toEqual({index: 8, InlineMarkdownClass: InlineCode, content: contentCode})
    expect(new InlineCode(contentCode).render())
      .toEqual(<Inline.Code>{contentText}</Inline.Code>)
  })
  test('find link', () => {
    const linkText = 'this link'
    const url = 'https://link.com'
    const contentLink = '[this link](https://link.com)'
    const resultLink = Markdown.findInlineMarkdown('click [this link](https://link.com)')
    expect(resultLink)
      .toEqual({index: 6, InlineMarkdownClass: Link, content: contentLink})
    expect(new Link(contentLink).render())
      .toEqual(<Inline.Link url={url}>{linkText}</Inline.Link>)
  })
  test('return the one with youngest index when the line has multiple type of markdowns', () => {
    const contentText = 'inline code'
    const contentCode = '`inline code`'
    const resultCode = Markdown.findInlineMarkdown('this is `inline code` and click [this link](https://link.com)')
    expect(resultCode)
      .toEqual({index: 8, InlineMarkdownClass: InlineCode, content: contentCode})
    expect(new InlineCode(contentCode).render())
      .toEqual(<Inline.Code>{contentText}</Inline.Code>)

    const linkText = 'this link'
    const url = 'https://link.com'
    const contentLink = '[this link](https://link.com)'
    const resultLink = Markdown.findInlineMarkdown('click [this link](https://link.com) and this is `inline code`')
    expect(resultLink)
      .toEqual({index: 6, InlineMarkdownClass: Link, content: contentLink})
    expect(new Link(contentLink).render())
      .toEqual(<Inline.Link url={url}>{linkText}</Inline.Link>)
  })
  test('return the one with shortest length when it has multiple candidates for its closing', () => {
    const contentText = 'inline code'
    const contentCode = '`inline code`'
    const resultCode = Markdown.findInlineMarkdown('this is `inline code` and this is `inline code`')
    expect(resultCode)
      .toEqual({index: 8, InlineMarkdownClass: InlineCode, content: contentCode})
    expect(new InlineCode(contentCode).render())
      .toEqual(<Inline.Code>{contentText}</Inline.Code>)

    const linkText = 'this link'
    const url = 'https://link.com'
    const contentLink = '[this link](https://link.com)'
    const resultLink = Markdown.findInlineMarkdown('click [this link](https://link.com) and click [this link](https://link.com)')
    expect(resultLink)
      .toEqual({index: 6, InlineMarkdownClass: Link, content: contentLink})
    expect(new Link(contentLink).render())
      .toEqual(<Inline.Link url={url}>{linkText}</Inline.Link>)
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
