import { View } from 'react-native'
import textStyles from '../../../theme/textStyles'
import { Text } from '../../common/withCustomFont'
import Markdown from './markdown'
import MultilineBlock from "./multilineBlock"

export default abstract class ListBlock extends Markdown {
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

export class OrderedList extends ListBlock {
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

export class UnorderedList extends ListBlock {
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

export class Quote extends ListBlock {
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
