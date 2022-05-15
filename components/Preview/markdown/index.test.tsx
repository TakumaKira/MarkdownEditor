import { blockLines } from "."
import LineMarkdown, { DefaultLine, H1Line, H2Line, H3Line, H4Line, H5Line, H6Line } from "./line"
import ListBlock, { OrderedList, Quote, UnorderedList } from "./listBlock"
import MultilineBlock, { BlockCode } from "./multilineBlock"

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
    const targetResult: (ListBlock | MultilineBlock | LineMarkdown)[] = [
      new H1Line('# Welcome to Markdown'),
      new DefaultLine(''),
      new DefaultLine('Markdown is a lightweight markup language that you can use to add formatting elements to plaintext text documents.'),
      new DefaultLine(''),
      new H2Line('## How to use this?'),
      new DefaultLine(''),
      new OrderedList([
        '1. Write markdown in the markdown editor window',
        '2. See the rendered markdown in the preview window',
      ]),
      new DefaultLine(''),
      new H3Line('### Features'),
      new DefaultLine(''),
      new UnorderedList([
        '- Create headings, paragraphs, links, blockquotes, inline-code, code blocks, and lists',
        '- Name and save the document to access again later',
        '- Choose between Light or Dark mode depending on your preference',
      ]),
      new DefaultLine(''),
      new Quote([
        '> This is an example of a blockquote. If you would like to learn more about markdown syntax, you can visit this [markdown cheatsheet](https://www.markdownguide.org/cheat-sheet/).',
      ]),
      new DefaultLine(''),
      new H4Line('#### Headings'),
      new DefaultLine(''),
      new DefaultLine("To create a heading, add the hash sign (#) before the heading. The number of number signs you use should correspond to the heading level. You'll see in this guide that we've used all six heading levels (not necessarily in the correct way you should use headings!) to illustrate how they should look."),
      new DefaultLine(''),
      new H5Line('##### Lists'),
      new DefaultLine(''),
      new DefaultLine('You can see examples of ordered and unordered lists above.'),
      new DefaultLine(''),
      new H6Line('###### Code Blocks'),
      new DefaultLine(''),
      new DefaultLine("This markdown editor allows for inline-code snippets, like this: `<p>I'm inline</p>`. It also allows for larger code blocks like this:"),
      new DefaultLine(''),
      new BlockCode([
        '<main>',
        '  <h1>This is a larger code block</h1>',
        '</main>',
      ]),
    ]
    expect(blockLines(input)).toEqual(targetResult)
  })
})
