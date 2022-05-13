import * as WebBrowser from 'expo-web-browser'
import React from "react"
import { Image, useWindowDimensions } from 'react-native'
import textStyles from "../../../theme/textStyles"
import { Text } from '../../common/withCustomFont'

type FoundMarkdownWithIndex = {
  index: number
  InlineMarkdownClass: InlineMarkdownTypes
  content: string
}
export default abstract class Markdown {
  static regexp: RegExp | null
  static find: (input: any) => any
  abstract render(): JSX.Element
  protected renderFragments(line: string): JSX.Element {
    return (
      <>{Markdown.splitByMarkdown(line).map((s, i) =>
        <React.Fragment key={i}>{s.render()}</React.Fragment>
      )}</>
    )
  }
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
}

export class Default extends InlineMarkdown {
  render(): JSX.Element {
    return (
      <>{this._line}</>
    )
  }
}

export class InlineCode extends InlineMarkdown {
  static override regexp = /`((?!`).)+`/
  render(): JSX.Element {
    return (
      <Inline.Code>{removeInlineMarkdown(this._line, 1)}</Inline.Code>
    )
  }
}

export class Link extends InlineMarkdown {
  static override regexp = /\[.*\]\(.*\)/
  render(): JSX.Element {
    /** Get "link text" and "url" from string like "[link text](url)" */
    const {url, text} = ((linkText: string): {url: string | null, text: string | null} => {
      let t: string | undefined
      const text = ((t = /\[.*\]/.exec(linkText)?.[0]) && removeInlineMarkdown(t, 1)) ?? null
      let u: string | undefined
      const url = ((u = /\(.*\)/.exec(linkText)?.[0]) && removeInlineMarkdown(u, 1)) ?? null
      return {url, text}
    })(this._line)

    return (
      <Inline.Link url={url}>{text}</Inline.Link>
    )
  }
}

export class Bold extends InlineMarkdown {
  static override regexp = /\*\*((?!\*).)+\*\*/
  render(): JSX.Element {
    return (
      <Inline.Bold>{removeInlineMarkdown(this._line, 2)}</Inline.Bold>
    )
  }
}

export class Italic extends InlineMarkdown {
  static override regexp = /\*((?!\*).)+\*/
  render(): JSX.Element {
    return (
      <Inline.Italic>{removeInlineMarkdown(this._line, 1)}</Inline.Italic>
    )
  }
}

export class InlineImage extends InlineMarkdown {
  static override regexp = /\!\[.*\]\(.*\)/
  render(): JSX.Element {
    /** Get "link text" and "url" from string like "![link text](url)" */
    const {url, text} = React.useMemo(() => {
      let t: string | undefined
      const text = ((t = /\!\[.*\]/.exec(this._line)?.[0]) && removeInlineMarkdown(t.replace('!', ''), 1)) ?? null
      let u: string | undefined
      const url = ((u = /\(.*\)/.exec(this._line)?.[0]) && removeInlineMarkdown(u, 1)) ?? null
      return {url, text}
    }, [this._line])

    return (url
      ? <Inline.Image url={url} altText={text} />
      : <></>
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

export const Inline: {[key in 'Code' | 'Link' | 'Bold' | 'Italic' | 'Image']: React.ComponentFactory<any, any>} = {
  Code: (props: {children: string}) =>
    <Text style={textStyles.markdownCode}>
      {props.children}
    </Text>,
  Link: (props: {children: string | null, url: string | null}) =>
    <Text style={textStyles.link} onPress={() => WebBrowser.openBrowserAsync(props.url ?? '')}>
      {props.children}
    </Text>,
  Bold: (props: {children: string}) =>
    <Text style={{fontWeight: 'bold'}}> {/* No need to prepare and/or define thicker weight font to make work */}
      {props.children}
    </Text>,
  Italic: (props: {children: string}) =>
    <Text style={{fontStyle: 'italic'}}> {/* No need to prepare and/or define italic style font to make work */}
      {props.children}
    </Text>,
  Image: (props: {url: string, altText: string}) => {
    const [originalSize, setOriginalSize] = React.useState({width: 0, height: 0})
    React.useEffect(() => {
      Image.getSize(props.url, (width, height) => {
        setOriginalSize({width, height})
      })
    }, [props.url])

    const windowWidth = useWindowDimensions().width
    const size = React.useMemo<{width: number, height: number}>(() => {
      const {width: originalWidth, height: originalHeight} = originalSize
      if (originalWidth < windowWidth / 2) {
        return {width: originalWidth, height: originalHeight}
      }
      const scale = windowWidth / 2 / originalWidth
      return {width: originalWidth * scale, height: originalHeight * scale}
    }, [originalSize, windowWidth])

    return <Image source={{uri: props.url}} style={size} resizeMode="contain" accessibilityLabel={props.altText} />
  },
} as const

/** Remove the first and the last character. */
function removeInlineMarkdown(input: string, markdownLength: number): string {
  return input.substring(markdownLength, input.length - markdownLength)
}
