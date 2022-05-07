import { StyleProp, TextStyle, View } from 'react-native'
import textStyles from '../../theme/textStyles'
import { Text } from '../common/withCustomFont'
import { Bullet, Inline } from './components'
import { readLinkText, removeInlineMarkdown, renderFragments } from './methods'
import { Block } from './models'
import { InlineMarkdownType, LineType, ListBlockType, MultilineBlockType } from "./types"

const ListBlockRegExps: {[key in ListBlockType]: RegExp} = {
  [ListBlockType.ORDERED_LIST]: /^\d+. /,
  [ListBlockType.UNORDERED_LIST]: /^- /,
  [ListBlockType.QUOTE]: /^> /,
} as const

export const LineTypes: {[key in LineType]: {regexp?: RegExp, style: StyleProp<TextStyle>}} = {
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

export const MultilineBlockTypes: {[key in MultilineBlockType]: {markdown: string, renderBlock: (block: Block) => JSX.Element}} = {
  [MultilineBlockType.CODE]: {
    markdown: "```",
    renderBlock: block =>
      <View style={textStyles.blockCode}>
        {block.lines.map((line, i) =>
          <Text
            style={textStyles.markdownCode}
            key={i}
          >
            {line}
          </Text>
        )}
      </View>,
  },
} as const

export const ListBlockTypes: {[key in ListBlockType]: {regexp: RegExp, isSuccessor: (prevLine: string, currLine: string) => boolean, renderBlock: (block: Block) => JSX.Element}} = {
  [ListBlockType.ORDERED_LIST]: {
    regexp: ListBlockRegExps[ListBlockType.ORDERED_LIST],
    isSuccessor: (prevLine, currLine) => {
      const prevNum = Number(ListBlockRegExps[ListBlockType.ORDERED_LIST].exec(prevLine)?.[0].replace('. ', ''))
      const currNum = Number(ListBlockRegExps[ListBlockType.ORDERED_LIST].exec(currLine)?.[0].replace('. ', ''))
      return prevNum + 1 === currNum
    },
    renderBlock: block =>
      <View style={textStyles.indent}>
        {block.lines.map((line, i) =>
          <Text
            style={[textStyles.previewParagraph, i === 0 ? undefined : textStyles.indentedLines]}
            key={i}
          >
            {renderFragments(line)}
          </Text>
        )}
      </View>,
  },
  [ListBlockType.UNORDERED_LIST]: {
    regexp: ListBlockRegExps[ListBlockType.UNORDERED_LIST],
    isSuccessor: (prevLine, currLine) => ListBlockRegExps[ListBlockType.UNORDERED_LIST].test(prevLine),
    renderBlock: block =>
      <View style={textStyles.indent}>
        {block.lines.map((line, i) =>
          <Text
            style={[textStyles.previewParagraph, i === 0 ? undefined : textStyles.indentedLines]}
            key={i}
          >
            <Bullet />{renderFragments(line.replace(ListBlockRegExps[ListBlockType.UNORDERED_LIST], ''))}
          </Text>
        )}
      </View>,
  },
  [ListBlockType.QUOTE]: {
    regexp: ListBlockRegExps[ListBlockType.QUOTE],
    isSuccessor: (prevLine, currLine) => ListBlockRegExps[ListBlockType.QUOTE].test(prevLine),
    renderBlock: block =>
      <View style={textStyles.blockQuote}>
        {block.lines.map((line, i) =>
          <Text
            style={textStyles.previewParagraphBold}
            key={i}
          >
            {renderFragments(line.replace(ListBlockRegExps[ListBlockType.QUOTE], ''))}
          </Text>
        )}
      </View>,
  },
} as const

export const InlineMarkdownTypes: {[key in InlineMarkdownType]: {regexp: RegExp, renderFragment: (input: string) => JSX.Element}} = {
  [InlineMarkdownType.CODE]: {
    regexp: /`.*`/,
    renderFragment: input => <Inline.Code>{removeInlineMarkdown(input)}</Inline.Code>
  },
  [InlineMarkdownType.LINK]: {
    regexp: /\[.*\]\(.*\)/,
    renderFragment: input => {
      const {url, text} = readLinkText(input)
      return <Inline.Link url={url}>{text}</Inline.Link>
    }
  },
} as const
