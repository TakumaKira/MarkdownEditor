import { Text } from 'react-native'
import textStyles from '../../../theme/textStyles'
import Markdown from './markdown'

export default abstract class Line extends Markdown {
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

export class DefaultLine extends Line {
  render(): JSX.Element {
    return (
      <Text style={textStyles.previewParagraph}>
        {this.renderFragments(this._line)}
      </Text>
    )
  }
}

export class H1Line extends Line {
  static override regexp = /^#{1} /
  render(): JSX.Element {
    return (
      <Text style={textStyles.previewH1}>
        {this.renderFragments(this._line.replace(H1Line.regexp, ''))}
      </Text>
    )
  }
}

export class H2Line extends Line {
  static override regexp = /^#{2} /
  render(): JSX.Element {
    return (
      <Text style={textStyles.previewH2}>
        {this.renderFragments(this._line.replace(H2Line.regexp, ''))}
      </Text>
    )
  }
}

export class H3Line extends Line {
  static override regexp = /^#{3} /
  render(): JSX.Element {
    return (
      <Text style={textStyles.previewH3}>
        {this.renderFragments(this._line.replace(H3Line.regexp, ''))}
      </Text>
    )
  }
}

export class H4Line extends Line {
  static override regexp = /^#{4} /
  render(): JSX.Element {
    return (
      <Text style={textStyles.previewH4}>
        {this.renderFragments(this._line.replace(H4Line.regexp, ''))}
      </Text>
    )
  }
}

export class H5Line extends Line {
  static override regexp = /^#{5} /
  render(): JSX.Element {
    return (
      <Text style={textStyles.previewH5}>
        {this.renderFragments(this._line.replace(H5Line.regexp, ''))}
      </Text>
    )
  }
}

export class H6Line extends Line {
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
