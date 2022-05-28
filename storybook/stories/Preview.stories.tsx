import { boolean } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react-native'
import React from 'react'
import { Image, Text as PureText, View } from 'react-native'
import { Text } from '../../components/common/withCustomFont'
import Preview from '../../components/Preview'
import * as data from '../../data.json'
import textStyles from '../../theme/textStyles'

const Bullet = () => {
  return (<Text>・</Text>)
}

storiesOf('Preview', module)
  .add('Preview', () =>
    <Preview children={data[1].content} />
  )
  .add('Preview - input text', () =>
    <>{data[1].content.split('\n').map((line, i) =>
      <Text key={i}>{line}</Text>
    )}</>
  )
  .add('Preview - target result', () => {
    /**
     * # Welcome to Markdown
     *
     * Markdown is a lightweight markup language that you can use to add formatting elements to plaintext text documents.
     *
     * ## How to use this?
     *
     * 1. Write markdown in the markdown editor window
     * 2. See the rendered markdown in the preview window
     *
     * ### Features
     *
     * - Create headings, paragraphs, links, blockquotes, inline-code, code blocks, and lists
     * - Name and save the document to access again later
     * - Choose between Light or Dark mode depending on your preference
     *
     * > This is an example of a blockquote. If you would like to learn more about markdown syntax, you can visit this [markdown cheatsheet](https://www.markdownguide.org/cheat-sheet/).
     *
     * #### Headings
     *
     * To create a heading, add the hash sign (#) before the heading. The number of number signs you use should correspond to the heading level. You'll see in this guide that we've used all six heading levels (not necessarily in the correct way you should use headings!) to illustrate how they should look.
     *
     * ##### Lists
     *
     * You can see examples of ordered and unordered lists above.
     *
     * ###### Code Blocks
     *
     * This markdown editor allows for inline-code snippets, like this: `<p>I'm inline</p>`. It also allows for larger code blocks like this:
     *
     * ```
     * <main>
     *   <h1>This is a larger code block</h1>
     * </main>
     * ```
     */

    return (
      <View>
        <Text style={textStyles.previewH1}>Welcome to Markdown</Text>
        <Text style={textStyles.previewParagraph}>Markdown is a lightweight markup language that you can use to add formatting elements to plaintext text documents.</Text>
        <Text style={textStyles.previewH2}>How to use this?</Text>
        <View style={textStyles.indent}>
          <Text style={textStyles.previewParagraph}>1. Write markdown in the markdown editor window</Text>
          <Text style={[textStyles.previewParagraph, textStyles.indentedLines]}>2. See the rendered markdown in the preview window</Text>
        </View>
        <Text style={textStyles.previewH3}>Features</Text>
        <View style={textStyles.indent}>
          <Text style={textStyles.previewParagraph}><Bullet />Create headings, paragraphs, links, blockquotes, inline-code, code blocks, and lists</Text>
          <Text style={[textStyles.previewParagraph, textStyles.indentedLines]}><Bullet />Name and save the document to access again later</Text>
          <Text style={[textStyles.previewParagraph, textStyles.indentedLines]}><Bullet />Choose between Light or Dark mode depending on your preference</Text>
        </View>
        <View style={textStyles.quoteBlock}>
          <Text style={textStyles.previewParagraphBold}>This is an example of a blockquote. If you would like to learn more about markdown syntax, you can visit this <Text style={textStyles.link} onPress={() => console.log('https://www.markdownguide.org/cheat-sheet/')}>markdown cheatsheet</Text></Text>
        </View>
        <Text style={textStyles.previewH4}>Headings</Text>
        <Text style={textStyles.previewParagraph}>To create a heading, add the hash sign (#) before the heading. The number of number signs you use should correspond to the heading level. You'll see in this guide that we've used all six heading levels (not necessarily in the correct way you should use headings!) to illustrate how they should look.</Text>
        <Text style={textStyles.previewH5}>Lists</Text>
        <Text style={textStyles.previewParagraph}>You can see examples of ordered and unordered lists above.</Text>
        <Text style={textStyles.previewH6}>Code Blocks</Text>
        <Text style={textStyles.previewParagraph}>This markdown editor allows for inline-code snippets, like this: <Text style={textStyles.markdownCode}>{"<p>I'm inline</p>"}</Text>. It also allows for larger code blocks like this:</Text>
        <View style={textStyles.codeBlock}>
          <Text style={textStyles.markdownCode}>{"<main>"}</Text>
          <Text style={textStyles.markdownCode}>{"  <h1>This is a larger code block</h1>"}</Text>
          <Text style={textStyles.markdownCode}>{"</main>"}</Text>
        </View>
      </View>
    )
  })
  .add('Inline Image test with pure react native components', () =>
    <PureText>
      <>test</>
      <Image source={{uri: 'https://picsum.photos/id/10/50'}} style={{width: 50, height: 50}} />
      <>test</>
    </PureText>
  )
  // This already has some trouble with displaying inline image on iOS and android
  .add('Preview - Inline Image test', () =>
    <Preview children={'test![image](https://picsum.photos/id/10/50)test'} disableImageEscapeOnMobile={boolean('Disable Image Escape on iOS/Android', false)} />
  )
  // This problem on android is not bearable
  .add('Preview - Double Inline Image test', () =>
    <Preview children={'test![small](https://picsum.photos/id/10/50)test![medium](https://picsum.photos/id/1000/200)test'} disableImageEscapeOnMobile={boolean('Disable Image Escape on iOS/Android', false)} />
  )
  // This breaks UI on iOS
  .add('Preview - Triple Inline Image test', () =>
    <Preview children={'test![small](https://picsum.photos/id/10/50)test![medium](https://picsum.photos/id/1000/200)test![large](https://picsum.photos/id/1002/300)test'} disableImageEscapeOnMobile={boolean('Disable Image Escape on iOS/Android', false)} />
  )
  .add('Preview - Inline Link Image test', () =>
    <Preview children={'[![image](https://picsum.photos/id/10/50)](https://picsum.photos/id/10/50)'} />
  )
  .add('Preview - SVG Image test', () =>
    <Preview children={'![svg](https://img.shields.io/badge/license-MIT-blue.svg)'} />
  )
