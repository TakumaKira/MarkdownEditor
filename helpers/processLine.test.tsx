import Inline from "../components/Inline"
import { findInlineMarkdown, InlineMarkdownType, splitByMarkdown } from "./processLine"

describe('findInlineMarkdown', () => {
  test('find inline code', () => {
    const contentText = 'inline code'
    const contentCode = '`inline code`'
    const resultCode = findInlineMarkdown('this is `inline code` and...')
    expect(resultCode)
      .toEqual({type: InlineMarkdownType.CODE, content: contentCode, index: 8, renderFragment: expect.any(Function)})
    expect(resultCode?.renderFragment())
      .toEqual(<Inline.Code>{contentText}</Inline.Code>)
  })
  test('find link', () => {
    const linkText = 'this link'
    const url = 'https://link.com'
    const contentLink = '[this link](https://link.com)'
    const resultLink = findInlineMarkdown('click [this link](https://link.com)')
    expect(resultLink)
      .toEqual({type: InlineMarkdownType.LINK, content: contentLink, index: 6, renderFragment: expect.any(Function)})
    expect(resultLink?.renderFragment())
      .toEqual(<Inline.Link url={url}>{linkText}</Inline.Link>)
  })
  test('return the one with youngest index when the line has multiple type of markdowns', () => {
    const contentText = 'inline code'
    const contentCode = '`inline code`'
    const resultCode = findInlineMarkdown('this is `inline code` and click [this link](https://link.com)')
    expect(resultCode)
      .toEqual({type: InlineMarkdownType.CODE, content: contentCode, index: 8, renderFragment: expect.any(Function)})
    expect(resultCode?.renderFragment())
      .toEqual(<Inline.Code>{contentText}</Inline.Code>)

    const linkText = 'this link'
    const url = 'https://link.com'
    const contentLink = '[this link](https://link.com)'
    const resultLink = findInlineMarkdown('click [this link](https://link.com) and this is `inline code`')
    expect(resultLink)
      .toEqual({type: InlineMarkdownType.LINK, content: contentLink, index: 6, renderFragment: expect.any(Function)})
    expect(resultLink?.renderFragment())
      .toEqual(<Inline.Link url={url}>{linkText}</Inline.Link>)
  })
  test('return the one with shortest length when it has multiple candidates for its closing', () => {
    const contentText = 'inline code'
    const contentCode = '`inline code`'
    const resultCode = findInlineMarkdown('this is `inline code` and this is `inline code`')
    expect(resultCode)
      .toEqual({type: InlineMarkdownType.CODE, content: contentCode, index: 8, renderFragment: expect.any(Function)})
    expect(resultCode?.renderFragment())
      .toEqual(<Inline.Code>{contentText}</Inline.Code>)

    const linkText = 'this link'
    const url = 'https://link.com'
    const contentLink = '[this link](https://link.com)'
    const resultLink = findInlineMarkdown('click [this link](https://link.com) and click [this link](https://link.com)')
    expect(resultLink)
      .toEqual({type: InlineMarkdownType.LINK, content: contentLink, index: 6, renderFragment: expect.any(Function)})
    expect(resultLink?.renderFragment())
      .toEqual(<Inline.Link url={url}>{linkText}</Inline.Link>)
  })
})

describe('splitByMarkdown', () => {
  test('return array of string or FoundMarkdown without any valid inline markdown', () => {
    expect(splitByMarkdown('this is `inline code` and click [this link](https://link.com) and this is `inline code`[this link](https://link.com)'))
      .toEqual([
        'this is ',
        {type: InlineMarkdownType.CODE, content: '`inline code`', renderFragment: expect.any(Function)},
        ' and click ',
        {type: InlineMarkdownType.LINK, content: '[this link](https://link.com)', renderFragment: expect.any(Function)},
        ' and this is ',
        {type: InlineMarkdownType.CODE, content: '`inline code`', renderFragment: expect.any(Function)},
        {type: InlineMarkdownType.LINK, content: '[this link](https://link.com)', renderFragment: expect.any(Function)},
      ])
  })
})
