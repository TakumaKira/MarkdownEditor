import { Text, View } from 'react-native'
import TextWithCustomFont from '../components/TextWithCustomFont'
import textStyles from '../theme/textStyles'
import { renderFragments } from './renderLines'

export enum MultilineBlockType {
  CODE = 'mbt_code',
}
export const MultilineBlockTypes: {[key in MultilineBlockType]: {markdown: string, renderBlock: (block: Block) => JSX.Element}} = {
  [MultilineBlockType.CODE]: {
    markdown: "```",
    renderBlock: block =>
      <View style={textStyles.blockCode}>
        {block.lines.map((line, i) =>
          <TextWithCustomFont
            style={textStyles.markdownCode}
            key={i}
          >
            {line}
          </TextWithCustomFont>
        )}
      </View>,
  },
} as const

const Bullet = () => {
  return (<Text>・</Text>)
}

export enum ListBlockType {
  ORDERED_LIST = 'lbt_orderedList',
  UNORDERED_LIST = 'lbt_unorderedList',
  QUOTE = 'lbt_quote',
}
const RegExps: {[key in ListBlockType]: RegExp} = {
  [ListBlockType.ORDERED_LIST]: /^\d+. /,
  [ListBlockType.UNORDERED_LIST]: /^- /,
  [ListBlockType.QUOTE]: /^> /,
} as const
export const ListBlockTypes: {[key in ListBlockType]: {regexp: RegExp, isSuccessor: (prevLine: string, currLine: string) => boolean, renderBlock: (block: Block) => JSX.Element}} = {
  [ListBlockType.ORDERED_LIST]: {
    regexp: RegExps[ListBlockType.ORDERED_LIST],
    isSuccessor: (prevLine, currLine) => {
      const prevNum = Number(RegExps[ListBlockType.ORDERED_LIST].exec(prevLine)?.[0].replace('. ', ''))
      const currNum = Number(RegExps[ListBlockType.ORDERED_LIST].exec(currLine)?.[0].replace('. ', ''))
      return prevNum + 1 === currNum
    },
    renderBlock: block =>
      <View style={textStyles.indent}>
        {block.lines.map((line, i) =>
          <TextWithCustomFont
            style={[textStyles.previewParagraph, i === 0 ? undefined : textStyles.indentedLines]}
            key={i}
          >
            {renderFragments(line)}
          </TextWithCustomFont>
        )}
      </View>,
  },
  [ListBlockType.UNORDERED_LIST]: {
    regexp: RegExps[ListBlockType.UNORDERED_LIST],
    isSuccessor: (prevLine, currLine) => RegExps[ListBlockType.UNORDERED_LIST].test(prevLine),
    renderBlock: block =>
      <View style={textStyles.indent}>
        {block.lines.map((line, i) =>
          <TextWithCustomFont
            style={[textStyles.previewParagraph, i === 0 ? undefined : textStyles.indentedLines]}
            key={i}
          >
            <Bullet />{renderFragments(line.replace(RegExps[ListBlockType.UNORDERED_LIST], ''))}
          </TextWithCustomFont>
        )}
      </View>,
  },
  [ListBlockType.QUOTE]: {
    regexp: RegExps[ListBlockType.QUOTE],
    isSuccessor: (prevLine, currLine) => RegExps[ListBlockType.QUOTE].test(prevLine),
    renderBlock: block =>
      <View style={textStyles.blockQuote}>
        {block.lines.map((line, i) =>
          <TextWithCustomFont
            style={textStyles.previewParagraphBold}
            key={i}
          >
            {renderFragments(line.replace(RegExps[ListBlockType.QUOTE], ''))}
          </TextWithCustomFont>
        )}
      </View>,
  },
} as const

export type Block = {
  type: ListBlockType | MultilineBlockType
  lines: string[]
}

export function blockLines(originalLines: string[]): (string | Block)[] {
  return findListBlocks(findMultilineBlocks(originalLines))
}

export function findMultilineBlocks(originalLines: string[]): (string | Block)[] {
  const result: (string | Block)[] = []
  let blockLinesBuffer: string[] = []
  let isInBlockFlag: MultilineBlockType | null = null
  for (const line of originalLines) {
    let thisLineIsValidFlag = false
    const blockType: MultilineBlockType | null = (() => {
      for (const _blockType of Object.keys(MultilineBlockTypes) as MultilineBlockType[]) {
        if (line === MultilineBlockTypes[_blockType].markdown) {
          return _blockType
        }
      }
      return null
    })()
    if (blockType) {
      if (isInBlockFlag === null) {
        blockLinesBuffer.push(line)
        thisLineIsValidFlag = true
        isInBlockFlag = blockType
      } else if (isInBlockFlag === blockType) {
        const [first, ...rest] = blockLinesBuffer
        result.push({type: isInBlockFlag, lines: rest})
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

export function findListBlocks(originalLines: (string | Block)[]): (string | Block)[] {
  const result: (string | Block)[] = []
  let blockLinesBuffer: string[] = []
  let prev: string | Block | null = null
  let prevBlockType: ListBlockType | null = null
  let currBlockType: ListBlockType | null = null
  for (const curr of originalLines) {
    prevBlockType = typeof prev === 'string' ? getBlockType(prev) : null
    currBlockType = typeof curr === 'string' ? getBlockType(curr) : null

    if (typeof prev === 'string' && typeof curr === 'string') {
      if (prevBlockType && currBlockType) {
        if (ListBlockTypes[currBlockType].isSuccessor(prev, curr)) {
          pushBlock(curr)
        } else {
          endBlock(prevBlockType)
          startBlock(curr)
        }
      } else if (!prevBlockType && currBlockType) {
        startBlock(curr)
      } else if (prevBlockType && !currBlockType) {
        endBlock(prevBlockType)
        pass(curr)
      } else {
        pass(curr)
      }
    } else if (typeof prev !== 'string' && typeof curr === 'string') {
      if (currBlockType) {
        startBlock(curr)
      } else {
        pass(curr)
      }
    } else if (typeof prev === 'string' && typeof curr !== 'string') {
      if (prevBlockType) {
        endBlock(prevBlockType)
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
    endBlock(currBlockType as ListBlockType)
  }
  return result

  function startBlock(curr: string) {
    blockLinesBuffer = [curr]
  }
  function pushBlock(curr: string) {
    blockLinesBuffer.push(curr)
  }
  function endBlock(prevBlockType: ListBlockType) {
    result.push({type: prevBlockType, lines: blockLinesBuffer})
    blockLinesBuffer = []
  }
  function pass(curr: string | Block) {
    result.push(curr)
  }

  function getBlockType(_line: string): ListBlockType | null {
    for (const _blockType of Object.keys(ListBlockTypes) as ListBlockType[]) {
      if (ListBlockTypes[_blockType].regexp.test(_line)) {
        return _blockType
      }
    }
    return null
  }
}
