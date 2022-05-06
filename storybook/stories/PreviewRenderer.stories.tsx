import { storiesOf } from '@storybook/react-native'
import React from 'react'
import { Text, View } from 'react-native'
import PreviewRenderer from '../../components/PreviewRenderer'
import TextWithCustomFont from '../../components/TextWithCustomFont'
import * as data from '../../data.json'
import textStyles from '../../theme/textStyles'

const Bullet = () => {
  return (<Text>・</Text>)
}

storiesOf('PreviewRenderer', module)
  .add('to Storybook', () =>
    <PreviewRenderer input={data[1].content} />
  )
  .add('input', () =>
    <>{data[1].content.split('\n').map((line, i) =>
      <Text key={i}>{line}</Text>
    )}</>
  )
  .add('target result', () =>
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

    <View>
      <TextWithCustomFont style={textStyles.previewH1}>Welcome to Markdown</TextWithCustomFont>
      <TextWithCustomFont style={textStyles.previewParagraph}>Markdown is a lightweight markup language that you can use to add formatting elements to plaintext text documents.</TextWithCustomFont>
      <TextWithCustomFont style={textStyles.previewH2}>How to use this?</TextWithCustomFont>
      <View style={textStyles.indent}>
        <TextWithCustomFont style={textStyles.previewParagraph}>1. Write markdown in the markdown editor window</TextWithCustomFont>
        <TextWithCustomFont style={[textStyles.previewParagraph, textStyles.indentedLines]}>2. See the rendered markdown in the preview window</TextWithCustomFont>
      </View>
      <TextWithCustomFont style={textStyles.previewH3}>Features</TextWithCustomFont>
      <View style={textStyles.indent}>
        <TextWithCustomFont style={textStyles.previewParagraph}><Bullet />Create headings, paragraphs, links, blockquotes, inline-code, code blocks, and lists</TextWithCustomFont>
        <TextWithCustomFont style={[textStyles.previewParagraph, textStyles.indentedLines]}><Bullet />Name and save the document to access again later</TextWithCustomFont>
        <TextWithCustomFont style={[textStyles.previewParagraph, textStyles.indentedLines]}><Bullet />Choose between Light or Dark mode depending on your preference</TextWithCustomFont>
      </View>
      <View style={textStyles.blockQuote}>
        <TextWithCustomFont style={textStyles.previewParagraphBold}>This is an example of a blockquote. If you would like to learn more about markdown syntax, you can visit this <TextWithCustomFont style={textStyles.link} onPress={() => console.log('https://www.markdownguide.org/cheat-sheet/')}>markdown cheatsheet</TextWithCustomFont></TextWithCustomFont>
      </View>
      <TextWithCustomFont style={textStyles.previewH4}>Headings</TextWithCustomFont>
      <TextWithCustomFont style={textStyles.previewParagraph}>To create a heading, add the hash sign (#) before the heading. The number of number signs you use should correspond to the heading level. You'll see in this guide that we've used all six heading levels (not necessarily in the correct way you should use headings!) to illustrate how they should look.</TextWithCustomFont>
      <TextWithCustomFont style={textStyles.previewH5}>Lists</TextWithCustomFont>
      <TextWithCustomFont style={textStyles.previewParagraph}>You can see examples of ordered and unordered lists above.</TextWithCustomFont>
      <TextWithCustomFont style={textStyles.previewH6}>Code Blocks</TextWithCustomFont>
      <TextWithCustomFont style={textStyles.previewParagraph}>This markdown editor allows for inline-code snippets, like this: <TextWithCustomFont style={textStyles.markdownCode}>{"<p>I'm inline</p>"}</TextWithCustomFont>. It also allows for larger code blocks like this:</TextWithCustomFont>
      <View style={textStyles.blockCode}>
        <TextWithCustomFont style={textStyles.markdownCode}>{"<main>"}</TextWithCustomFont>
        <TextWithCustomFont style={textStyles.markdownCode}>{"  <h1>This is a larger code block</h1>"}</TextWithCustomFont>
        <TextWithCustomFont style={textStyles.markdownCode}>{"</main>"}</TextWithCustomFont>
      </View>
    </View>
  )
