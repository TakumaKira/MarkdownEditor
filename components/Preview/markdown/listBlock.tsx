import React from 'react'
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
    return (
      <Block.OrderedList renderFragments={this.renderFragments}>{JSON.stringify(this._lines)}</Block.OrderedList>
    )
  }
}

export class UnorderedList extends ListBlock {
  static override regexp = /^- /
  static override isSuccessor(prevLine: string, currLine: string): boolean {
    return UnorderedList.regexp.test(prevLine)
  }
  render(): JSX.Element{
    return (
      <Block.UnorderedList renderFragments={this.renderFragments}>{JSON.stringify(this._lines)}</Block.UnorderedList>
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
      <Block.Quote renderFragments={this.renderFragments}>{JSON.stringify(this._lines)}</Block.Quote>
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

const Block: {[key in 'OrderedList' | 'UnorderedList' | 'Quote']: React.MemoExoticComponent<any>} = {
  OrderedList: React.memo((props: {children: string, renderFragments: (line: string) => JSX.Element}) => {
    const lines: string[] = JSON.parse(props.children)
    const getNumber = (line: string): number => {
      return Number(OrderedList.regexp.exec(line)![0].replace('. ', ''))
    }
    /** Reserved width which can contain the number with longest width */
    const getWidth = () => {
      const biggestNum = getNumber(lines[lines.length - 1])
      const digit = (biggestNum + '').length
      // a number letter has less than 8px, and dot has less than 2px
      return digit * 8 + 2
    }
    const ListNumber = React.memo((props: {children: number}) => {
      return (
        <View style={[listStyles.itemHeaderContainer, listStyles.numberContainer, {width: getWidth()}]}>
          <Text style={textStyles.previewParagraph}>{props.children}.</Text>
        </View>
      )
    })
    return (
      <View style={textStyles.indent}>
        {lines.map((line, i) => {
          return (
            <View
              style={[listStyles.itemContainer, i === 0 ? undefined : textStyles.indentedLines]}
              key={i}
            >
              <ListNumber>{getNumber(line)}</ListNumber>
              <Text style={textStyles.previewParagraph}>
                {props.renderFragments(line.replace(OrderedList.regexp, ''))}
              </Text>
            </View>
          )
        })}
      </View>
    )
  }),
  UnorderedList: React.memo((props: {children: string, renderFragments: (line: string) => JSX.Element}) => {
    const Bullet = React.memo(() => {
      return (
        <View style={[listStyles.itemHeaderContainer, listStyles.bulletContainer]}>
          <View style={listStyles.bullet} />
        </View>
      )
    })
    return (
      <View style={textStyles.indent}>
        {(JSON.parse(props.children) as string[]).map((line, i) =>
          <View
            style={[listStyles.itemContainer, i === 0 ? undefined : textStyles.indentedLines]}
            key={i}
          >
            <Bullet />
            <Text style={textStyles.previewParagraph}>
              {props.renderFragments(line.replace(UnorderedList.regexp, ''))}
            </Text>
          </View>
        )}
      </View>
    )
  }),
  Quote: React.memo((props: {children: string, renderFragments: (line: string) => JSX.Element}) =>
    <View style={textStyles.quoteBlock}>
      {(JSON.parse(props.children) as string[]).map((line, i) =>
        <Text
          style={textStyles.previewParagraphBold}
          key={i}
        >
          <View style={quoteStyles.viewMarker} />
          {props.renderFragments(line.replace(Quote.regexp, ''))}
        </Text>
      )}
    </View>),
} as const
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
