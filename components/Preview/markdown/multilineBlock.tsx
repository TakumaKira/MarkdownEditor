import React from 'react'
import { View } from 'react-native'
import { useAppSelector } from '../../../store/hooks'
import { selectColorScheme } from '../../../store/slices/theme'
import textStyles from '../../../theme/textStyles'
import themeColors from '../../../theme/themeColors'
import { Text } from '../../common/withCustomFont'
import Markdown from './markdown'

export default abstract class MultilineBlock extends Markdown {
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
  override is(prev: MultilineBlock): boolean {
    return JSON.stringify(prev._lines) === JSON.stringify(this._lines)
  }
}

export class BlockCode extends MultilineBlock {
  static override type = Symbol('BlockCode')
  static override regexp = /^```$/
  render(): JSX.Element{
    return (
      <Multiline.BlockCode>{this._lines}</Multiline.BlockCode>
    )
  }
}

type MultilineBlockMarkdownTypes
  = typeof BlockCode
const MultilineBlockMarkdowns: MultilineBlockMarkdownTypes[] = [
  BlockCode,
]

const Multiline: {[key in 'BlockCode']: React.MemoExoticComponent<any>} = {
  BlockCode: React.memo((props: {children: string[]}) => {
    const colorScheme = useAppSelector(selectColorScheme)
    return (
      <View style={[textStyles.codeBlock, themeColors[colorScheme].blockBg]}>
        {props.children.map((line, i) =>
          <Text
            style={[textStyles.markdownCode, themeColors[colorScheme].previewMarkdown]}
            key={i}
          >
            {line}
          </Text>
        )}
      </View>
    )
  },
  (prevProps, nextProps) => JSON.stringify(prevProps.children) === JSON.stringify(nextProps.children)),
} as const
