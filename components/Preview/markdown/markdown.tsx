import * as WebBrowser from 'expo-web-browser'
import React from "react"
import { Image, useWindowDimensions } from 'react-native'
import { v4 as uuidv4 } from 'uuid'
import textStyles from "../../../theme/textStyles"
import { Text } from '../../common/withCustomFont'
import { PREVIEW_PADDING_LEFT, PREVIEW_PADDING_RIGHT } from '../../EditorView'

type FoundMarkdownWithIndex = {
  index: number
  InlineMarkdownClass: InlineMarkdownTypes
  content: string
}
export default abstract class Markdown {
  static regexp: RegExp | null
  static find: (input: any) => any
  abstract render(): JSX.Element
  abstract is(prev: Markdown): boolean
  private _id: string = uuidv4()
  get id(): string {
    return this._id
  }
  static FragmentRenderer = React.memo((props: {children: string}) => {
    return (
      <>{Markdown.splitByMarkdown(props.children).map((s, i) =>
        <React.Fragment key={i}>{s.render()}</React.Fragment>
      )}</>
    )
  })
  // Technically, methods below can be private member, but these needs to be tested itself.
  static splitByMarkdown(input: string): InlineMarkdown[] {
    return Markdown._splitByMarkdown([input]) as InlineMarkdown[]
  }
  static _splitByMarkdown(input: (string | InlineMarkdown)[]): (string | InlineMarkdown)[] {
    if (input.length === 0) {
      return input
    }
    const last = input[input.length - 1]
    if (typeof last !== 'string') {
      return input
    }
    const foundMarkdown = Markdown.findInlineMarkdown(last)
    if (!foundMarkdown) {
      input[input.length - 1] = new Default(last)
      return input
    }
    const {InlineMarkdownClass, content, index} = foundMarkdown
    const before = index === 0
      ? null
      : last.substring(0, index)
    const after = index + content.length < last.length
      ? last.substring(index + content.length)
      : null
    input.pop()
    before && input.push(new Default(before))
    input.push(new InlineMarkdownClass(content))
    after && input.push(after)
    return Markdown._splitByMarkdown(input)
  }
  static findInlineMarkdown(line: string): FoundMarkdownWithIndex | null {
    // Find the result of each markdown
    const results: FoundMarkdownWithIndex[] = []
    for (const _InlineMarkdownClass of InlineMarkdowns) {
      const result = _InlineMarkdownClass.regexp?.exec(line) ?? null
      if (result) {
        // Initial result might include multiple markdown as like closing markdown was actually of second or third one,
        // so check again with removing the last character which must be the part of the closing markdown.
        let content = result[0]
        let r: RegExpExecArray | null
        // Look for shorter result till we could not find the new one.
        while ((r = _InlineMarkdownClass.regexp?.exec(content.substring(0, content.length - 2)) ?? null) !== null) {
          // If we got the result without the last character, it should be shorter result.
          if (r) {
            content = r[0]
          }
        }
        // The original parameter of renderFragment can be fixed here.
        results.push({InlineMarkdownClass: _InlineMarkdownClass, content, index: result.index})
      }
    }
    // We want to chose a type of markdown with the youngest start index.
    const oneWithYoungestIndex = results.reduce((prev, curr, i) => {
      return prev.index < curr.index ? prev : curr
    }, results[0])
    return oneWithYoungestIndex ?? null
  }
}


// You might want to move InlineMarkdowns to another file, but Markdown and InlineMarkdowns are strongly dependent on each other, so it easily occurs circular dependencies if you tried it.

abstract class InlineMarkdown extends Markdown {
  constructor(protected _line: string) {
    super()
  }
  override is(prev: InlineMarkdown): boolean {
    return prev._line === this._line
  }
}

export class Default extends InlineMarkdown {
  render(): JSX.Element {
    return (
      <Inline.Default>{this._line}</Inline.Default>
    )
  }
}

export class InlineCode extends InlineMarkdown {
  static override regexp = /`((?!`).)+`/
  render(): JSX.Element {
    return (
      <Inline.Code>{this._line}</Inline.Code>
    )
  }
}

export class Link extends InlineMarkdown {
  static override regexp = /\[.*\]\(.*\)/
  render(): JSX.Element {
    return (
      <Inline.Link>{this._line}</Inline.Link>
    )
  }
}

export class Bold extends InlineMarkdown {
  static override regexp = /\*\*((?!\*).)+\*\*/
  render(): JSX.Element {
    return (
      <Inline.Bold>{this._line}</Inline.Bold>
    )
  }
}

export class Italic extends InlineMarkdown {
  static override regexp = /\*((?!\*).)+\*/
  render(): JSX.Element {
    return (
      <Inline.Italic>{this._line}</Inline.Italic>
    )
  }
}

export class InlineImage extends InlineMarkdown {
  static override regexp = /\!\[.*\]\(.*\)/
  render(): JSX.Element {
    return (
      <Inline.Image>{this._line}</Inline.Image>
    )
  }
}

type InlineMarkdownTypes
  = typeof Default
  | typeof InlineCode
  | typeof Link
  | typeof Bold
  | typeof Italic
  | typeof InlineImage
const InlineMarkdowns: InlineMarkdownTypes[] = [
  Default,
  InlineCode,
  Link,
  Bold,
  Italic,
  InlineImage,
]

export const Inline: {[key in 'Default' | 'Code' | 'Link' | 'Bold' | 'Italic' | 'Image']: React.MemoExoticComponent<any>} = {
  Default: React.memo((props: {children: string}) =>
    <>
      {props.children}
    </>),
  Code: React.memo((props: {children: string}) =>
    <Text style={textStyles.markdownCode}>
      {removeInlineMarkdown(props.children, 1)}
    </Text>),
  Link: React.memo((props: {children: string}) => {
    /** Get "link text" and "url" from string like "[link text](url)" */
    const {url, text} = React.useMemo(() => {
      let t: string | undefined
      const text = ((t = /\[.*\]/.exec(props.children)?.[0]) && removeInlineMarkdown(t, 1)) ?? null
      let u: string | undefined
      const url = ((u = /\(.*\)/.exec(props.children)?.[0]) && removeInlineMarkdown(u, 1)) ?? null
      return {url, text}
    }, [props.children])

    return (
      <Text style={textStyles.link} onPress={() => WebBrowser.openBrowserAsync(url ?? '')}>
        {text}
      </Text>
    )
  }),
  Bold: React.memo((props: {children: string}) =>
    <Text style={{fontWeight: 'bold'}}> {/* No need to prepare and/or define thicker weight font to make work */}
      {removeInlineMarkdown(props.children, 2)}
    </Text>),
  Italic: React.memo((props: {children: string}) =>
    <Text style={{fontStyle: 'italic'}}> {/* No need to prepare and/or define italic style font to make work */}
      {removeInlineMarkdown(props.children, 1)}
    </Text>),
  Image: React.memo((props: {children: string}) => {
    /** Get "link text" and "url" from string like "![link text](url)" */
    const {url, text} = React.useMemo(() => {
      let t: string | undefined
      const text = ((t = /\!\[.*\]/.exec(props.children)?.[0]) && removeInlineMarkdown(t.replace('!', ''), 1)) ?? null
      let u: string | undefined
      const url = ((u = /\(.*\)/.exec(props.children)?.[0]) && removeInlineMarkdown(u, 1)) ?? null
      return {url, text}
    }, [props.children])

    const [originalSize, setOriginalSize] = React.useState({width: 0, height: 0})
    React.useEffect(() => {
      url && Image.getSize(url, (width, height) => {
        setOriginalSize({width, height})
      })
    }, [url])

    const windowWidth = useWindowDimensions().width
    const size = React.useMemo<{width: number, height: number}>(() => {
      const {width: originalWidth, height: originalHeight} = originalSize
      const previewWidth = windowWidth / 2 - PREVIEW_PADDING_LEFT - PREVIEW_PADDING_RIGHT
      if (originalWidth < previewWidth) {
        return {width: originalWidth, height: originalHeight}
      }
      const scale = previewWidth / originalWidth
      return {width: originalWidth * scale, height: originalHeight * scale}
    }, [originalSize, windowWidth])

    return url
      // TODO: Cache image for changing except url
      ? <Image source={{uri: url}} style={size} resizeMode="contain" accessibilityLabel={text ?? undefined} />
      : null
  }),
} as const

/** Remove the first and the last character. */
function removeInlineMarkdown(input: string, markdownLength: number): string {
  return input.substring(markdownLength, input.length - markdownLength)
}
