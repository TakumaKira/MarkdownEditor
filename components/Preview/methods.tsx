import React from 'react'
import { Text } from '../common/withCustomFont'
import { InlineMarkdownTypes, LineTypes, ListBlockTypes, MultilineBlockTypes } from "./constants"
import { Block, FoundMarkdown, FoundMarkdownWithIndex } from "./models"
import { InlineMarkdownType, LineType, ListBlockType, MultilineBlockType } from "./types"

export default function render(input: string) {
  return (
    <>
      {blockLines(input.split('\n'))
        .map((line, i) =>
          <React.Fragment key={i}>{renderLine(line)}</React.Fragment>
      )}
    </>
  )
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

export function renderLine(line: string | Block): JSX.Element {
  if (typeof line === 'string') {
    return renderStringLine(line)
  }
  return renderBlockLine(line)
}
function renderStringLine(originalLine: string): JSX.Element {
  const {lineType, restOfLine} = ((_line: string) => {
    for (const lineType of Object.keys(LineTypes) as LineType[]) {
      const result = LineTypes[lineType].regexp?.exec(_line) ?? null
      if (result) {
        return {lineType, restOfLine: _line.replace(result[0], '')}
      }
    }
    return {lineType: LineType.DEFAULT, restOfLine: _line}
  })(originalLine)

  return (
    <Text style={LineTypes[lineType].style}>
      {renderFragments(restOfLine)}
    </Text>
  )
}
function renderBlockLine(line: Block): JSX.Element {
  if (Object.values(MultilineBlockType).includes(line.type as MultilineBlockType)) {
    const type = line.type as MultilineBlockType
    return MultilineBlockTypes[type].renderBlock(line)
  }
  const type = line.type as ListBlockType
  return ListBlockTypes[type].renderBlock(line)
}
export function renderFragments(line: string): JSX.Element {
  return (
    <>{splitByMarkdown(line).map((s, i) =>
      <React.Fragment key={i}>{typeof s === 'string' ? s : s.renderFragment()}</React.Fragment>
    )}</>
  )
}

/** Remove the first and the last character. */
export function removeInlineMarkdown(input: string): string {
  return input.substring(1, input.length - 1)
}

/** Get "link text" and "url" from string like "[link text](url)" */
export function readLinkText(linkText: string): {url: string | null, text: string | null} {
  let t: string | undefined
  const text = ((t = /\[.*\]/.exec(linkText)?.[0]) && removeInlineMarkdown(t)) ?? null
  let u: string | undefined
  const url = ((u = /\(.*\)/.exec(linkText)?.[0]) && removeInlineMarkdown(u)) ?? null
  return {url, text}
}
