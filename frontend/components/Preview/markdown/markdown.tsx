import env from '../../../env'
import * as WebBrowser from 'expo-web-browser'
import React from "react"
import { Image, Platform } from 'react-native'
import { v4 as uuidv4 } from 'uuid'
import { PreviewContext } from '../../../contexts/previewContext'
import { useAppSelector } from '../../../store/hooks'
import { selectColorScheme } from '../../../store/slices/theme'
import colors from '../../../theme/colors'
import textStyles from "../../../theme/textStyles"
import themeColors from '../../../theme/themeColors'
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
  abstract is(prev: Markdown): boolean
  private _id: string = uuidv4()
  get id(): string {
    return this._id
  }
  get isUnmounted(): boolean {
    return this._isUnmounted
  }
  private _isUnmounted = false
  protected unmount(): void {
    this._isUnmounted = true
  }
  static fragmentsMemo: InlineMarkdown[] = []
  static FragmentRenderer = React.memo((props: {children: string}) => {
    // Re-use instances of Markdown when the line(s) are the same.
    const [blocks, setBlocks] = React.useState<InlineMarkdown[]>([])
    React.useEffect(() => {
      const newBlocks = Markdown.splitByMarkdown(props.children)
      const stock = [...Markdown.fragmentsMemo]
      const newFragments = newBlocks.map(newBlock => {
        for (let i = 0; i < stock.length; i++) {
          if (newBlock.constructor.name === stock[i].constructor.name && newBlock.is(stock[i])) {
            return stock.splice(i, 1)[0]
          }
        }
        return newBlock
      })
      Markdown.fragmentsMemo.push(...newFragments)
      setBlocks(newFragments)
    }, [props.children])

    return (
      <>{blocks.map(s =>
        <React.Fragment key={s.id}>{s.render()}</React.Fragment>
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
        results.push({InlineMarkdownClass: _InlineMarkdownClass, content: result[0], index: result.index})
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
      <Inline.Default unmount={() => this.unmount()}>{this._line}</Inline.Default>
    )
  }
}

export class InlineCode extends InlineMarkdown {
  static override regexp = /`((?!`).)+`/
  render(): JSX.Element {
    return (
      <Inline.Code unmount={() => this.unmount()}>{this._line}</Inline.Code>
    )
  }
}

export class Link extends InlineMarkdown {
  /** This regular expression accepts strings which includes paired square brackets inside outer square brackets */
  static override regexp = /\[((((?!\[|\]).)*\[((?!\[|\]).)*\]((?!\[|\]).)+)|(((?!\[|\]).)*))*\]\(((?!\)).)*\)/

  private _url: string
  private _text: string
  constructor(line: string) {
    super(line)

    /** Get "url" and "text" from string like "[link text](url)" */
    let t: string | undefined
    this._text = ((t = /^\[((((?!\[|\]).)*\[((?!\[|\]).)*\]((?!\[|\]).)*)|(((?!\[|\]).)*))*\]/.exec(this._line)?.[0]) && t.slice(1, -1)) ?? ''
    this._url = t ? this._line.slice(t.length + 1, -1) : ''
  }
  override is(prev: Link): boolean {
    if (prev._url === this._url) {
      // When url is same, then it is considered as the same, but line and text should be updated.
      prev._line = this._line
      prev._text = this._text
      return true
    }
    return false
  }
  render(): JSX.Element {
    return (
      <Inline.Link url={this._url} unmount={() => this.unmount()}>{this._text}</Inline.Link>
    )
  }
}

export class Bold extends InlineMarkdown {
  static override regexp = /\*\*((?!\*).)+\*\*/
  render(): JSX.Element {
    return (
      <Inline.Bold unmount={() => this.unmount()}>{this._line}</Inline.Bold>
    )
  }
}

export class Italic extends InlineMarkdown {
  static override regexp = /\*((?!\*).)+\*/
  render(): JSX.Element {
    return (
      <Inline.Italic unmount={() => this.unmount()}>{this._line}</Inline.Italic>
    )
  }
}

export class InlineImage extends InlineMarkdown {
  static override regexp = /\!\[((?!\]).)*\]\(((?!\)).)*\)/
  private _url: string | null
  private _text: string | null
  constructor(line: string) {
    super(line)

    /** Get "url" from string like "![link text](url)" */
    this._url = (() => {
      let u: string | undefined
      const url = ((u = /\(((?!\)).)*\)/.exec(this._line)?.[0]) && removeInlineMarkdown(u, 1)) ?? null
      return url
    })()
    this._text = (() => {
      let t: string | undefined
      const text = ((t = /\!\[((?!\]).)*\]/.exec(this._line)?.[0]) && removeInlineMarkdown(t.replace('!', ''), 1)) ?? null
      return text
    })()
  }
  override is(prev: InlineImage): boolean {
    if (prev._url === this._url) {
      // When url is same, then it is considered as the same, but line and text should be updated.
      prev._line = this._line
      prev._text = this._text
      return true
    }
    return false
  }
  render(): JSX.Element {
    return (
      <Inline.Image url={this._url} text={this._text} unmount={() => this.unmount()} />
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

export const Inline: {[key in 'Default' | 'Code' | 'Link' | 'Bold' | 'Italic' | 'Image']: React.ComponentFactory<any, any>} = {
  Default: (props: {children: string, unmount: () => void}) => {
    React.useEffect(() => {
      return () => props.unmount()
    }, [])

    return (
      <Text>
        {props.children}
      </Text>
    )
  },
  Code: (props: {children: string, unmount: () => void}) => {
    React.useEffect(() => {
      return () => props.unmount()
    }, [])
    const colorScheme = useAppSelector(selectColorScheme)
    return (
      <Text style={[textStyles.markdownCode, themeColors[colorScheme].previewMarkdown]}>
        {removeInlineMarkdown(props.children, 1)}
      </Text>
    )
  },
  Link: (props: {url: string, children: string, unmount: () => void}) => {
    React.useEffect(() => {
      return () => props.unmount()
    }, [])

    return (
      <Text style={textStyles.link} onPress={() => WebBrowser.openBrowserAsync(props.url ?? '')}>
        <Markdown.FragmentRenderer>{props.children}</Markdown.FragmentRenderer>
      </Text>
    )
  },
  Bold: (props: {children: string, unmount: () => void}) => {
    React.useEffect(() => {
      return () => props.unmount()
    }, [])

    return (
      <Text style={{fontWeight: 'bold'}}> {/* No need to prepare and/or define thicker weight font to make work */}
        {removeInlineMarkdown(props.children, 2)}
      </Text>
    )
  },
  Italic: (props: {children: string, unmount: () => void}) => {
    React.useEffect(() => {
      return () => props.unmount()
    }, [])

    return (
      <Text style={{fontStyle: 'italic'}}> {/* No need to prepare and/or define italic style font to make work */}
        {removeInlineMarkdown(props.children, 1)}
      </Text>
    )
  },
  Image: (props: {url: string, text: string, unmount: () => void}) => {
    const {input, viewerWidth, disableImageEscapeOnMobile} = React.useContext(PreviewContext)
    const originalSize = useMemoizedImageSize(props.url)

    const size = React.useMemo<{width: number, height: number} | undefined>(() => {
      if (!originalSize) {
        return
      }
      const {width: originalWidth, height: originalHeight} = originalSize
      if (!viewerWidth || originalWidth < viewerWidth) {
        return {width: originalWidth, height: originalHeight}
      }
      const scale = viewerWidth / originalWidth
      return {width: originalWidth * scale, height: originalHeight * scale}
    }, [originalSize, viewerWidth])

    React.useEffect(() => {
      return () => props.unmount()
    }, [])

    // Currently, this escapes all image markdown on iOS/Android due to layout issue of inline image. When removing the escape, this should also support SVG on iOS/Android.
    return ((!disableImageEscapeOnMobile && Platform.OS !== 'web')
      ? <Text style={[textStyles.link, {color: colors[400]}]} onPress={() => WebBrowser.openBrowserAsync(`${env.WEB_VERSION_URL}?input=${encodeURIComponent(input)}`)}>
        {`[Markdown "![${props.text}](${props.url})" is escaped to avoid not the best rendering result of inline images in React Native on iOS/Android. Please check your result on web version of this app.]`}
      </Text>
      : <Image source={{uri: props.url}} style={size} resizeMode="contain" accessibilityLabel={props.text ?? undefined} />
    )
  },
} as const

const imageSizeMemo: {[url in string]: {width: number, height: number}} = {}
const useMemoizedImageSize = (url: string) => {
  const [originalSize, setOriginalSize] = React.useState<{width: number, height: number}>()
  if (imageSizeMemo[url]) {
    return imageSizeMemo[url]
  }
  Image.getSize(url, (width, height) => {
    imageSizeMemo[url] = {width, height}
    setOriginalSize(imageSizeMemo[url])
  })
  return originalSize
}

/** Remove the first and the last character. */
function removeInlineMarkdown(input: string, markdownLength: number): string {
  return input.substring(markdownLength, input.length - markdownLength)
}
