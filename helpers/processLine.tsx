import Inline from "../components/Inline"

export enum InlineMarkdownType {
  CODE = 'code',
  LINK = 'link',
}

const InlineMarkdownTypes: {[key in InlineMarkdownType]: {regexp: RegExp, renderFragment: (input: string) => JSX.Element}} = {
  [InlineMarkdownType.CODE]: {
    regexp: /`.*`/,
    renderFragment: input => <Inline.Code>{removeInlineMarkdown(input)}</Inline.Code>
  },
  [InlineMarkdownType.LINK]: {
    regexp: /\[.*\]\(.*\)/,
    renderFragment: input => {
      const {url, text} = readLinkText(input)
      if (!url || !text) {
        console.error('url', url, 'text', text)
        throw new Error('url and text cannot be null')
      }
      return <Inline.Link url={url}>{text}</Inline.Link>
    }
  },
} as const

type FoundMarkdown = {
  type: InlineMarkdownType
  content: string
  renderFragment: () => JSX.Element
}
type FoundMarkdownWithIndex = FoundMarkdown & {
  index: number
}

export function splitByMarkdown(input: string): (string | FoundMarkdown)[] {
  return _splitByMarkdown([input])
}

function _splitByMarkdown(input: (string | FoundMarkdown)[]): (string | FoundMarkdown)[] {
  if (input.length === 0) {
    return input
  }
  const last = input[input.length - 1]
  if (typeof last !== 'string') {
    return input
  }
  const foundMarkdown = findInlineMarkdown(last)
  if (!foundMarkdown) {
    return input
  }
  const {type, content, index, renderFragment} = foundMarkdown
  const before = index === 0
    ? null
    : last.substring(0, index)
  const after = index + content.length < last.length
    ? last.substring(index + content.length)
    : null
  input.pop()
  before && input.push(before)
  input.push({type, content, renderFragment})
  after && input.push(after)
  return _splitByMarkdown(input)
}

export function findInlineMarkdown(line: string): FoundMarkdownWithIndex | null {
  // Find the result of each markdown
  const results: FoundMarkdownWithIndex[] = []
  for (const markdownType of (Object.keys(InlineMarkdownTypes) as InlineMarkdownType[])) {
    const result = InlineMarkdownTypes[markdownType].regexp.exec(line)
    if (result) {
      // Initial result might include multiple markdown as like closing markdown was actually of second or third one,
      // so check again with removing the last character which must be the part of the closing markdown.
      let content = result[0]
      let r: RegExpExecArray | null
      // Look for shorter result till we could not find the new one.
      while ((r = InlineMarkdownTypes[markdownType].regexp.exec(content.substring(0, content.length - 2))) !== null) {
        // If we got the result without the last character, it should be shorter result.
        if (r) {
          content = r[0]
        }
      }
      // The original parameter of renderFragment can be fixed here.
      results.push({type: markdownType, content, index: result.index, renderFragment: () => InlineMarkdownTypes[markdownType].renderFragment(content)})
    }
  }
  // We want to chose a type of markdown with the youngest start index.
  const oneWithYoungestIndex = results.reduce((prev, curr, i) => {
    if (i !== 0 && prev.index === curr.index) {
      throw new Error('Multiple markdown types with the same start index is not supported')
    }
    return prev.index < curr.index ? prev : curr
  }, results[0])
  return oneWithYoungestIndex ?? null
}

/** Remove the first and the last character. */
function removeInlineMarkdown(input: string): string {
  return input.substring(1, input.length - 1)
}

/** Get "link text" and "url" from string like "[link text](url)" */
function readLinkText(linkText: string): {url: string | null, text: string | null} {
  let t: string | undefined
  const text = ((t = /\[.*\]/.exec(linkText)?.[0]) && removeInlineMarkdown(t)) ?? null
  let u: string | undefined
  const url = ((u = /\(.*\)/.exec(linkText)?.[0]) && removeInlineMarkdown(u)) ?? null
  return {url, text}
}
