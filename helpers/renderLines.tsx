import React from 'react'
import { StyleProp, TextStyle } from 'react-native'
import TextWithCustomFont from '../components/TextWithCustomFont'
import textStyles from '../theme/textStyles'
import { splitByMarkdown } from './processLine'
import { Block, ListBlockType, ListBlockTypes, MultilineBlockType, MultilineBlockTypes } from './processLines'

enum LineType {
  DEFAULT = 'default',
  H1 = 'h1',
  H2 = 'h2',
  H3 = 'h3',
  H4 = 'h4',
  H5 = 'h5',
  H6 = 'h6',
}

const LineTypes: {[key in LineType]: {regexp?: RegExp, style: StyleProp<TextStyle>}} = {
  [LineType.DEFAULT]: {
    style: textStyles.previewParagraph,
  },
  [LineType.H1]: {
    regexp: /^#{1} /,
    style: textStyles.previewH1,
  },
  [LineType.H2]: {
    regexp: /^#{2} /,
    style: textStyles.previewH2,
  },
  [LineType.H3]: {
    regexp: /^#{3} /,
    style: textStyles.previewH3,
  },
  [LineType.H4]: {
    regexp: /^#{4} /,
    style: textStyles.previewH4,
  },
  [LineType.H5]: {
    regexp: /^#{5} /,
    style: textStyles.previewH5,
  },
  [LineType.H6]: {
    regexp: /^#{6} /,
    style: textStyles.previewH6,
  },
} as const

export default function renderLine(line: string | Block): JSX.Element {
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
    <TextWithCustomFont style={LineTypes[lineType].style}>
      {renderFragments(restOfLine)}
    </TextWithCustomFont>
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
