import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useAppSelector } from '../../../store/hooks'
import { selectColorScheme } from '../../../store/slices/theme'
import colors from '../../../theme/colors'
import textStyles from '../../../theme/textStyles'
import themeColors from '../../../theme/themeColors'
import Markdown from './markdown'

export default abstract class LineMarkdown extends Markdown {
  constructor(protected _line: string) {
    super()
  }
  static override find(line: string): LineMarkdown {
    for (const Line of LineMarkdowns) {
      const result = Line.regexp?.exec(line) ?? null
      if (result) {
        return new Line(line)
      }
    }
    return new DefaultLine(line)
  }
  override is(prev: LineMarkdown): boolean {
    return prev._line === this._line
  }
}

export class DefaultLine extends LineMarkdown {
  render(): JSX.Element {
    return (
      <Line.Default>{this._line}</Line.Default>
    )
  }
}

export class H1Line extends LineMarkdown {
  static override regexp = /^#{1} /
  render(): JSX.Element {
    return (
      <Line.H1>{this._line}</Line.H1>
    )
  }
}

export class H2Line extends LineMarkdown {
  static override regexp = /^#{2} /
  render(): JSX.Element {
    return (
      <Line.H2>{this._line}</Line.H2>
    )
  }
}

export class H3Line extends LineMarkdown {
  static override regexp = /^#{3} /
  render(): JSX.Element {
    return (
      <Line.H3>{this._line}</Line.H3>
    )
  }
}

export class H4Line extends LineMarkdown {
  static override regexp = /^#{4} /
  render(): JSX.Element {
    return (
      <Line.H4>{this._line}</Line.H4>
    )
  }
}

export class H5Line extends LineMarkdown {
  static override regexp = /^#{5} /
  render(): JSX.Element {
    return (
      <Line.H5>{this._line}</Line.H5>
    )
  }
}

export class H6Line extends LineMarkdown {
  static override regexp = /^#{6} /
  render(): JSX.Element {
    return (
      <Line.H6>{this._line}</Line.H6>
    )
  }
}

export class HorizontalRule extends LineMarkdown {
  static override regexp = /^-{3}$/
  render(): JSX.Element {
    return (
      <Line.Rule />
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
  | typeof HorizontalRule
const LineMarkdowns: ListMarkdownTypes[] = [
  DefaultLine,
  H1Line,
  H2Line,
  H3Line,
  H4Line,
  H5Line,
  H6Line,
  HorizontalRule,
]

const Line: {[key in 'Default' | 'H1' | 'H2' | 'H3' | 'H4' | 'H5' | 'H6' | 'Rule']: React.MemoExoticComponent<any>} = {
  Default: React.memo((props: {children: string}) => {
    const colorScheme = useAppSelector(selectColorScheme)
    return (
      <Text style={[textStyles.previewParagraph, themeColors[colorScheme].previewParagraph]}>
        <Markdown.FragmentRenderer>{props.children}</Markdown.FragmentRenderer>
      </Text>
    )
  }),
  H1: React.memo((props: {children: string}) => {
    const colorScheme = useAppSelector(selectColorScheme)
    return (
      <Text style={[textStyles.previewH1, themeColors[colorScheme].previewHeader]}>
        <Markdown.FragmentRenderer>{props.children.replace(H1Line.regexp, '')}</Markdown.FragmentRenderer>
      </Text>
    )
  }),
  H2: React.memo((props: {children: string}) => {
    const colorScheme = useAppSelector(selectColorScheme)
    return (
      <Text style={[textStyles.previewH2, themeColors[colorScheme].previewHeader]}>
        <Markdown.FragmentRenderer>{props.children.replace(H2Line.regexp, '')}</Markdown.FragmentRenderer>
      </Text>
    )
  }),
  H3: React.memo((props: {children: string}) => {
    const colorScheme = useAppSelector(selectColorScheme)
    return (
      <Text style={[textStyles.previewH3, themeColors[colorScheme].previewHeader]}>
        <Markdown.FragmentRenderer>{props.children.replace(H3Line.regexp, '')}</Markdown.FragmentRenderer>
      </Text>
    )
  }),
  H4: React.memo((props: {children: string}) => {
    const colorScheme = useAppSelector(selectColorScheme)
    return (
      <Text style={[textStyles.previewH4, themeColors[colorScheme].previewHeader]}>
        <Markdown.FragmentRenderer>{props.children.replace(H4Line.regexp, '')}</Markdown.FragmentRenderer>
      </Text>
    )
  }),
  H5: React.memo((props: {children: string}) => {
    const colorScheme = useAppSelector(selectColorScheme)
    return (
      <Text style={[textStyles.previewH5, themeColors[colorScheme].previewHeader]}>
        <Markdown.FragmentRenderer>{props.children.replace(H5Line.regexp, '')}</Markdown.FragmentRenderer>
      </Text>
    )
  }),
  H6: React.memo((props: {children: string}) => {
    const colorScheme = useAppSelector(selectColorScheme)
    return (
      <Text style={[textStyles.previewH6, themeColors[colorScheme].previewHeader]}>
        <Markdown.FragmentRenderer>{props.children.replace(H6Line.regexp, '')}</Markdown.FragmentRenderer>
      </Text>
    )
  }),
  Rule: React.memo(() =>
    <View style={horizontalRuleStyles.container}>
      <View style={horizontalRuleStyles.rule} />
    </View>),
} as const
const horizontalRuleStyles = StyleSheet.create({
  container: {
    height: 24,
    justifyContent: 'center',
  },
  rule: {
    height: 2,
    backgroundColor: colors[500],
  },
})
