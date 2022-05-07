import { Inline } from "./components"
import { blockLines, findInlineMarkdown, findListBlocks, findMultilineBlocks, splitByMarkdown } from "./methods"
import { Block } from "./models"
import { InlineMarkdownType, ListBlockType, MultilineBlockType } from "./types"

describe('blockLines', () => {
  test('returns intended result', () => {
    const input: string[] = [
      '# Welcome to Markdown',
      '',
      'Markdown is a lightweight markup language that you can use to add formatting elements to plaintext text documents.',
      '',
      '## How to use this?',
      '',
      '1. Write markdown in the markdown editor window',
      '2. See the rendered markdown in the preview window',
      '',
      '### Features',
      '',
      '- Create headings, paragraphs, links, blockquotes, inline-code, code blocks, and lists',
      '- Name and save the document to access again later',
      '- Choose between Light or Dark mode depending on your preference',
      '',
      '> This is an example of a blockquote. If you would like to learn more about markdown syntax, you can visit this [markdown cheatsheet](https://www.markdownguide.org/cheat-sheet/).',
      '',
      '#### Headings',
      '',
      "To create a heading, add the hash sign (#) before the heading. The number of number signs you use should correspond to the heading level. You'll see in this guide that we've used all six heading levels (not necessarily in the correct way you should use headings!) to illustrate how they should look.",
      '',
      '##### Lists',
      '',
      'You can see examples of ordered and unordered lists above.',
      '',
      '###### Code Blocks',
      '',
      "This markdown editor allows for inline-code snippets, like this: `<p>I'm inline</p>`. It also allows for larger code blocks like this:",
      '',
      '```',
      '<main>',
      '  <h1>This is a larger code block</h1>',
      '</main>',
      '```',
    ]
    const targetResult: (string | Block)[] = [
      '# Welcome to Markdown',
      '',
      'Markdown is a lightweight markup language that you can use to add formatting elements to plaintext text documents.',
      '',
      '## How to use this?',
      '',
      {
        type: ListBlockType.ORDERED_LIST,
        lines: [
          '1. Write markdown in the markdown editor window',
          '2. See the rendered markdown in the preview window',
        ]
      },
      '',
      '### Features',
      '',
      {
        type: ListBlockType.UNORDERED_LIST,
        lines: [
          '- Create headings, paragraphs, links, blockquotes, inline-code, code blocks, and lists',
          '- Name and save the document to access again later',
          '- Choose between Light or Dark mode depending on your preference',
        ]
      },
      '',
      {
        type: ListBlockType.QUOTE,
        lines: [
          '> This is an example of a blockquote. If you would like to learn more about markdown syntax, you can visit this [markdown cheatsheet](https://www.markdownguide.org/cheat-sheet/).',
        ]
      },
      '',
      '#### Headings',
      '',
      "To create a heading, add the hash sign (#) before the heading. The number of number signs you use should correspond to the heading level. You'll see in this guide that we've used all six heading levels (not necessarily in the correct way you should use headings!) to illustrate how they should look.",
      '',
      '##### Lists',
      '',
      'You can see examples of ordered and unordered lists above.',
      '',
      '###### Code Blocks',
      '',
      "This markdown editor allows for inline-code snippets, like this: `<p>I'm inline</p>`. It also allows for larger code blocks like this:",
      '',
      {
        type: MultilineBlockType.CODE,
        lines: [
          '<main>',
          '  <h1>This is a larger code block</h1>',
          '</main>',
        ]
      },
    ]
    expect(blockLines(input)).toEqual(targetResult)
  })
})

describe('findMultilineBlocks', () => {
  test('returns intended result', () => {
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
    const expectedResult: (string | Block)[] = [
      'line 1',
      {
        type: MultilineBlockType.CODE,
        lines: [
          'line 3',
          'line 4',
        ]
      },
      'line 6',
      '```',
      'line 8',
    ]
    expect(findMultilineBlocks(originalLines)).toEqual(expectedResult)
  })
  test('returns empty array if passed empty array', () => {
    expect(findMultilineBlocks([])).toEqual([])
  })
  test('supports empty block', () => {
    expect(findMultilineBlocks(['```', '```'])).toEqual([{type: MultilineBlockType.CODE, lines: []}])
  })
})

describe('findListBlocks', () => {
  test('returns intended result', () => {
    const input: (string | Block)[] = [
      '# Welcome to Markdown',
      '',
      'Markdown is a lightweight markup language that you can use to add formatting elements to plaintext text documents.',
      '',
      '## How to use this?',
      '',
      '1. Write markdown in the markdown editor window',
      '2. See the rendered markdown in the preview window',
      '',
      '### Features',
      '',
      '- Create headings, paragraphs, links, blockquotes, inline-code, code blocks, and lists',
      '- Name and save the document to access again later',
      '- Choose between Light or Dark mode depending on your preference',
      '',
      '> This is an example of a blockquote. If you would like to learn more about markdown syntax, you can visit this [markdown cheatsheet](https://www.markdownguide.org/cheat-sheet/).',
      '',
      '#### Headings',
      '',
      "To create a heading, add the hash sign (#) before the heading. The number of number signs you use should correspond to the heading level. You'll see in this guide that we've used all six heading levels (not necessarily in the correct way you should use headings!) to illustrate how they should look.",
      '',
      '##### Lists',
      '',
      'You can see examples of ordered and unordered lists above.',
      '',
      '###### Code Blocks',
      '',
      "This markdown editor allows for inline-code snippets, like this: `<p>I'm inline</p>`. It also allows for larger code blocks like this:",
      '',
      {
        type: MultilineBlockType.CODE,
        lines: [
          '<main>',
          '  <h1>This is a larger code block</h1>',
          '</main>',
        ]
      },
    ]
    const targetResult: (string | Block)[] = [
      '# Welcome to Markdown',
      '',
      'Markdown is a lightweight markup language that you can use to add formatting elements to plaintext text documents.',
      '',
      '## How to use this?',
      '',
      {
        type: ListBlockType.ORDERED_LIST,
        lines: [
          '1. Write markdown in the markdown editor window',
          '2. See the rendered markdown in the preview window',
        ]
      },
      '',
      '### Features',
      '',
      {
        type: ListBlockType.UNORDERED_LIST,
        lines: [
          '- Create headings, paragraphs, links, blockquotes, inline-code, code blocks, and lists',
          '- Name and save the document to access again later',
          '- Choose between Light or Dark mode depending on your preference',
        ]
      },
      '',
      {
        type: ListBlockType.QUOTE,
        lines: [
          '> This is an example of a blockquote. If you would like to learn more about markdown syntax, you can visit this [markdown cheatsheet](https://www.markdownguide.org/cheat-sheet/).',
        ]
      },
      '',
      '#### Headings',
      '',
      "To create a heading, add the hash sign (#) before the heading. The number of number signs you use should correspond to the heading level. You'll see in this guide that we've used all six heading levels (not necessarily in the correct way you should use headings!) to illustrate how they should look.",
      '',
      '##### Lists',
      '',
      'You can see examples of ordered and unordered lists above.',
      '',
      '###### Code Blocks',
      '',
      "This markdown editor allows for inline-code snippets, like this: `<p>I'm inline</p>`. It also allows for larger code blocks like this:",
      '',
      {
        type: MultilineBlockType.CODE,
        lines: [
          '<main>',
          '  <h1>This is a larger code block</h1>',
          '</main>',
        ]
      },
    ]
    expect(findListBlocks(input)).toEqual(targetResult)
  })
  test('returns correctly when MultilineBlockType passed right after ListBlockType', () => {
    const input: (string | Block)[] = [
      '> test',
      {
        type: MultilineBlockType.CODE,
        lines: []
      },
    ]
    const targetResult: (string | Block)[] = [
      {
        type: ListBlockType.QUOTE,
        lines: [
          '> test',
        ]
      },
      {
        type: MultilineBlockType.CODE,
        lines: []
      },
    ]
    expect(findListBlocks(input)).toEqual(targetResult)
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

describe('renderLines', () => {
  test('returns intended result', () => {

  })
})
