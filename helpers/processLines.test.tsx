import { Block, blockLines, findListBlocks, findMultilineBlocks, ListBlockType, MultilineBlockType } from "./processLines"

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
