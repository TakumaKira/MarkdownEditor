import * as WebBrowser from 'expo-web-browser'
import React from 'react'
import { View } from 'react-native'
import textStyles from '../../theme/textStyles'
import { Text } from '../common/withCustomFont'

export default function render(input: string): JSX.Element {
  return (
    <>
      {ListBlock.find(MultilineBlock.find(input.split('\n')))
        .map(line =>
          typeof line === 'string'
            ? Line.find(line)
            : line)
        .map((line, i) => <React.Fragment key={i}>{line.render()}</React.Fragment>)}
    </>
  )
}

type FoundMarkdownWithIndex = {
  index: number
  InlineMarkdownClass: InlineMarkdownTypes
  content: string
}
abstract class Markdown {
  static regexp: RegExp | null
  static find: (input: any) => any
  abstract render(): JSX.Element
  protected renderFragments(line: string): JSX.Element {
    return (
      <>{this.splitByMarkdown(line).map((s, i) =>
        <React.Fragment key={i}>{s.render()}</React.Fragment>
      )}</>
    )
  }
  private splitByMarkdown(input: string): InlineMarkdown[] {
    return this._splitByMarkdown([input]) as InlineMarkdown[]
  }
  private _splitByMarkdown(input: (string | InlineMarkdown)[]): (string | InlineMarkdown)[] {
    if (input.length === 0) {
      return input
    }
    const last = input[input.length - 1]
    if (typeof last !== 'string') {
      return input
    }
    const foundMarkdown = this.findInlineMarkdown(last)
    if (!foundMarkdown) {
      input[input.length - 1] = new Default(last)
      return input
    }
    const {InlineMarkdownClass, content, index} = foundMarkdown
    const before = index === 0
      ? null
      : last.substring(0, index)
    const after = index + content.length < last.length
      ? last.substring(index + content.length)
      : null
    input.pop()
    before && input.push(new Default(before))
    input.push(new InlineMarkdownClass(content))
    after && input.push(new Default(after))
    return this._splitByMarkdown(input)
  }
  private findInlineMarkdown(line: string): FoundMarkdownWithIndex | null {
    // Find the result of each markdown
    const results: FoundMarkdownWithIndex[] = []
    for (const _InlineMarkdownClass of InlineMarkdowns) {
      const result = _InlineMarkdownClass.regexp?.exec(line) ?? null
      if (result) {
        // Initial result might include multiple markdown as like closing markdown was actually of second or third one,
        // so check again with removing the last character which must be the part of the closing markdown.
        let content = result[0]
        let r: RegExpExecArray | null
        // Look for shorter result till we could not find the new one.
        while ((r = _InlineMarkdownClass.regexp?.exec(content.substring(0, content.length - 2)) ?? null) !== null) {
          // If we got the result without the last character, it should be shorter result.
          if (r) {
            content = r[0]
          }
        }
        // The original parameter of renderFragment can be fixed here.
        results.push({InlineMarkdownClass: _InlineMarkdownClass, content, index: result.index})
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
}

abstract class MultilineBlock extends Markdown {
  static type: Symbol
  constructor(protected _lines: string[]) {
    super()
  }
  static override find(input: string[]): (string | MultilineBlock)[] {
    const result: (string | MultilineBlock)[] = []
    let blockLinesBuffer: string[] = []
    let isInBlockFlag: Symbol | null = null
    for (const line of input) {
      let thisLineIsValidFlag = false
      const Block: MultilineBlockMarkdownTypes | null = (() => {
        for (const MultilineBlockMarkdown of MultilineBlockMarkdowns) {
          if (MultilineBlockMarkdown.regexp.test(line)) {
            return MultilineBlockMarkdown
          }
        }
        return null
      })()
      if (Block) {
        if (isInBlockFlag === null) {
          blockLinesBuffer.push(line)
          thisLineIsValidFlag = true
          isInBlockFlag = Block.type
        } else if (isInBlockFlag === Block.type) {
          const [first, ...rest] = blockLinesBuffer
          result.push(new Block(rest))
          blockLinesBuffer = []
          thisLineIsValidFlag = true
          isInBlockFlag = null
        }
      }
      if (!thisLineIsValidFlag) {
        if (isInBlockFlag === null) {
          result.push(line)
        } else {
          blockLinesBuffer.push(line)
        }
      }
    }
    if (blockLinesBuffer.length > 0) {
      result.push(...blockLinesBuffer)
    }
    return result
  }
}

class BlockCode extends MultilineBlock {
  static override type = Symbol('BlockCode')
  static override regexp = /^```$/
  render(): JSX.Element{
    return (
      <View style={textStyles.blockCode}>
        {this._lines.map((line, i) =>
          <Text
            style={textStyles.markdownCode}
            key={i}
          >
            {line}
          </Text>
        )}
      </View>
    )
  }
}

type MultilineBlockMarkdownTypes
  = typeof BlockCode
const MultilineBlockMarkdowns: MultilineBlockMarkdownTypes[] = [
  BlockCode,
]

abstract class ListBlock extends Markdown {
  static isSuccessor: (prevLine: string, currLine: string) => boolean
  constructor(protected _lines: string[]) {
    super()
  }
  static override find(input: (string | MultilineBlock)[]): (string | MultilineBlock | ListBlock)[] {
    const result: (string | MultilineBlock | ListBlock)[] = []
    let blockLinesBuffer: string[] = []
    let prev: string | MultilineBlock | ListBlock | null = null
    let PrevBlock: ListBlockMarkdownTypes | null = null
    let CurrBlock: ListBlockMarkdownTypes | null = null
    for (const curr of input) {
      PrevBlock = typeof prev === 'string' ? getBlock(prev) : null
      CurrBlock = typeof curr === 'string' ? getBlock(curr) : null

      if (typeof prev === 'string' && typeof curr === 'string') {
        if (PrevBlock && CurrBlock) {
          if (CurrBlock.isSuccessor(prev, curr)) {
            pushBlock(curr)
          } else {
            endBlock(PrevBlock)
            startBlock(curr)
          }
        } else if (!PrevBlock && CurrBlock) {
          startBlock(curr)
        } else if (PrevBlock && !CurrBlock) {
          endBlock(PrevBlock)
          pass(curr)
        } else {
          pass(curr)
        }
      } else if (typeof prev !== 'string' && typeof curr === 'string') {
        if (CurrBlock) {
          startBlock(curr)
        } else {
          pass(curr)
        }
      } else if (typeof prev === 'string' && typeof curr !== 'string') {
        if (PrevBlock) {
          endBlock(PrevBlock)
          pass(curr)
        } else {
          pass(curr)
        }
      } else {
        pass(curr)
      }

      prev = curr
    }
    if (blockLinesBuffer.length > 0) {
      endBlock(CurrBlock as ListBlockMarkdownTypes)
    }
    return result

    function startBlock(curr: string) {
      blockLinesBuffer = [curr]
    }
    function pushBlock(curr: string) {
      blockLinesBuffer.push(curr)
    }
    function endBlock(prevBlock: ListBlockMarkdownTypes) {
      result.push(new prevBlock(blockLinesBuffer))
      blockLinesBuffer = []
    }
    function pass(curr: string | MultilineBlock) {
      result.push(curr)
    }

    function getBlock(_line: string): ListBlockMarkdownTypes | null {
      for (const Block of ListBlockMarkdowns) {
        if (Block.regexp.test(_line)) {
          return Block
        }
      }
      return null
    }
  }
}

class OrderedList extends ListBlock {
  static override regexp = /^\d+. /
  static override isSuccessor(prevLine: string, currLine: string): boolean {
    const prevNum = Number(OrderedList.regexp.exec(prevLine)?.[0].replace('. ', ''))
    const currNum = Number(OrderedList.regexp.exec(currLine)?.[0].replace('. ', ''))
    return prevNum + 1 === currNum
  }
  render(): JSX.Element{
    return (
      <View style={textStyles.indent}>
        {this._lines.map((line, i) =>
          <Text
            style={[textStyles.previewParagraph, i === 0 ? undefined : textStyles.indentedLines]}
            key={i}
          >
            {this.renderFragments(line)}
          </Text>
        )}
      </View>
    )
  }
}

class UnorderedList extends ListBlock {
  static override regexp = /^- /
  static override isSuccessor(prevLine: string, currLine: string): boolean {
    return UnorderedList.regexp.test(prevLine)
  }
  render(): JSX.Element{
    const Bullet = () => {
      return (<Text>・</Text>)
    }
    return (
      <View style={textStyles.indent}>
        {this._lines.map((line, i) =>
          <Text
            style={[textStyles.previewParagraph, i === 0 ? undefined : textStyles.indentedLines]}
            key={i}
          >
            <Bullet />{this.renderFragments(line.replace(UnorderedList.regexp, ''))}
          </Text>
        )}
      </View>
    )
  }
}

class Quote extends ListBlock {
  static override regexp = /^> /
  static override isSuccessor(prevLine: string, currLine: string): boolean {
    return Quote.regexp.test(prevLine)
  }
  render(): JSX.Element{
    return (
      <View style={textStyles.blockQuote}>
        {this._lines.map((line, i) =>
          <Text
            style={textStyles.previewParagraphBold}
            key={i}
          >
            {this.renderFragments(line.replace(Quote.regexp, ''))}
          </Text>
        )}
      </View>
    )
  }
}

type ListBlockMarkdownTypes
  = typeof OrderedList
  | typeof UnorderedList
  | typeof Quote
const ListBlockMarkdowns: ListBlockMarkdownTypes[] = [
  OrderedList,
  UnorderedList,
  Quote,
]

abstract class Line extends Markdown {
  constructor(protected _line: string) {
    super()
  }
  static override find(line: string): Line {
    for (const Line of LineMarkdowns) {
      const result = Line.regexp?.exec(line) ?? null
      if (result) {
        return new Line(line)
      }
    }
    return new DefaultLine(line)
  }
}

class DefaultLine extends Line {
  render(): JSX.Element {
    return (
      <Text style={textStyles.previewParagraph}>
        {this.renderFragments(this._line)}
      </Text>
    )
  }
}

class H1Line extends Line {
  static override regexp = /^#{1} /
  render(): JSX.Element {
    return (
      <Text style={textStyles.previewH1}>
        {this.renderFragments(this._line.replace(H1Line.regexp, ''))}
      </Text>
    )
  }
}

class H2Line extends Line {
  static override regexp = /^#{2} /
  render(): JSX.Element {
    return (
      <Text style={textStyles.previewH2}>
        {this.renderFragments(this._line.replace(H2Line.regexp, ''))}
      </Text>
    )
  }
}

class H3Line extends Line {
  static override regexp = /^#{3} /
  render(): JSX.Element {
    return (
      <Text style={textStyles.previewH3}>
        {this.renderFragments(this._line.replace(H3Line.regexp, ''))}
      </Text>
    )
  }
}

class H4Line extends Line {
  static override regexp = /^#{4} /
  render(): JSX.Element {
    return (
      <Text style={textStyles.previewH4}>
        {this.renderFragments(this._line.replace(H4Line.regexp, ''))}
      </Text>
    )
  }
}

class H5Line extends Line {
  static override regexp = /^#{5} /
  render(): JSX.Element {
    return (
      <Text style={textStyles.previewH5}>
        {this.renderFragments(this._line.replace(H5Line.regexp, ''))}
      </Text>
    )
  }
}

class H6Line extends Line {
  static override regexp = /^#{6} /
  render(): JSX.Element {
    return (
      <Text style={textStyles.previewH6}>
        {this.renderFragments(this._line.replace(H6Line.regexp, ''))}
      </Text>
    )
  }
}

type ListMarkdownTypes
  = typeof DefaultLine
  | typeof H1Line
  | typeof H2Line
  | typeof H3Line
  | typeof H4Line
  | typeof H5Line
  | typeof H6Line
const LineMarkdowns: ListMarkdownTypes[] = [
  DefaultLine,
  H1Line,
  H2Line,
  H3Line,
  H4Line,
  H5Line,
  H6Line,
]

abstract class InlineMarkdown extends Markdown {
  constructor(protected _line: string) {
    super()
  }
}

class Default extends InlineMarkdown {
  render(): JSX.Element {
    return (
      <>{this._line}</>
    )
  }
}

class InlineCode extends InlineMarkdown {
  static override regexp = /`.*`/
  render(): JSX.Element {
    return (
      <Inline.Code>{removeInlineMarkdown(this._line)}</Inline.Code>
    )
  }
}

class Link extends InlineMarkdown {
  static override regexp = /\[.*\]\(.*\)/
  render(): JSX.Element {
    /** Get "link text" and "url" from string like "[link text](url)" */
    const {url, text} = ((linkText: string): {url: string | null, text: string | null} => {
      let t: string | undefined
      const text = ((t = /\[.*\]/.exec(linkText)?.[0]) && removeInlineMarkdown(t)) ?? null
      let u: string | undefined
      const url = ((u = /\(.*\)/.exec(linkText)?.[0]) && removeInlineMarkdown(u)) ?? null
      return {url, text}
    })(this._line)

    return (
      <Inline.Link url={url}>{text}</Inline.Link>
    )
  }
}

type InlineMarkdownTypes
  = typeof Default
  | typeof InlineCode
  | typeof Link
const InlineMarkdowns: InlineMarkdownTypes[] = [
  Default,
  InlineCode,
  Link,
]

const Inline: {[key in string]: React.ComponentFactory<any, any>} = {
  Code: (props: {children: string}) =>
    <Text style={textStyles.markdownCode}>
      {props.children}
    </Text>,
  Link: (props: {children: string | null, url: string | null}) =>
    <Text style={textStyles.link} onPress={() => WebBrowser.openBrowserAsync(props.url ?? '')}>
      {props.children}
    </Text>
} as const

/** Remove the first and the last character. */
function removeInlineMarkdown(input: string): string {
  return input.substring(1, input.length - 1)
}
