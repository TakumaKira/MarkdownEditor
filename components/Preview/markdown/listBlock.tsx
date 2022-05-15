import { StyleSheet, View } from 'react-native'
import colors from '../../../theme/colors'
import textStyles from '../../../theme/textStyles'
import { Text } from '../../common/withCustomFont'
import Markdown from './markdown'
import MultilineBlock from "./multilineBlock"

export default abstract class ListBlock extends Markdown {
  static isSuccessor: (prevLine: string, currLine: string) => boolean
  constructor(protected _lines: string[]) {
    super()
  }
  static override find(input: ReturnType<typeof MultilineBlock.find>): (string | MultilineBlock | ListBlock)[] {
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
  render(): JSX.Element {
    const getNumber = (line: string): number => {
      return Number(OrderedList.regexp.exec(line)![0].replace('. ', ''))
    }
    /** Reserved width which can contain the number with longest width */
    const getWidth = () => {
      const biggestNum = getNumber(this._lines[this._lines.length - 1])
      const digit = (biggestNum + '').length
      // a number letter has less than 8px, and dot has less than 2px
      return digit * 8 + 2
    }
    const ListNumber = (props: {children: number}) => {
      return (
        <View style={[listStyles.itemHeaderContainer, listStyles.numberContainer, {width: getWidth()}]}>
          <Text style={textStyles.previewParagraph}>{props.children}.</Text>
        </View>
      )
    }
    return (
      <View style={textStyles.indent}>
        {this._lines.map((line, i) => {
          return (
            <View
              style={[listStyles.itemContainer, i === 0 ? undefined : textStyles.indentedLines]}
              key={i}
            >
              <ListNumber>{getNumber(line)}</ListNumber>
              <Text style={textStyles.previewParagraph}>
                {this.renderFragments(line.replace(OrderedList.regexp, ''))}
              </Text>
            </View>
          )
        })}
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
      return (
        <View style={[listStyles.itemHeaderContainer, listStyles.bulletContainer]}>
          <View style={listStyles.bullet} />
        </View>
      )
    }
    return (
      <View style={textStyles.indent}>
        {this._lines.map((line, i) =>
          <View
            style={[listStyles.itemContainer, i === 0 ? undefined : textStyles.indentedLines]}
            key={i}
          >
            <Bullet />
            <Text style={textStyles.previewParagraph}>
              {this.renderFragments(line.replace(UnorderedList.regexp, ''))}
            </Text>
          </View>
        )}
      </View>
    )
  }
}
const listStyles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
  },
  itemHeaderContainer: {
    height: 24,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  numberContainer: {
    marginRight: 9,
    alignItems: 'flex-end',
  },
  bulletContainer: {
    width: 19,
  },
  bullet: {
    height: 3,
    width: 3,
    borderRadius: 1.5,
    backgroundColor: colors.Orange,
  },
})

export class Quote extends ListBlock {
  static override regexp = /^> /
  static override isSuccessor(prevLine: string, currLine: string): boolean {
    return Quote.regexp.test(prevLine)
  }
  render(): JSX.Element{
    return (
      <View style={textStyles.quoteBlock}>
        {this._lines.map((line, i) =>
          <Text
            style={textStyles.previewParagraphBold}
            key={i}
          >
            <View style={quoteStyles.viewMarker} />
            {this.renderFragments(line.replace(Quote.regexp, ''))}
          </Text>
        )}
      </View>
    )
  }
}
const quoteStyles = StyleSheet.create({
  viewMarker: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: 4,
    backgroundColor: colors.Orange,
  },
})

type ListBlockMarkdownTypes
  = typeof OrderedList
  | typeof UnorderedList
  | typeof Quote
const ListBlockMarkdowns: ListBlockMarkdownTypes[] = [
  OrderedList,
  UnorderedList,
  Quote,
]
