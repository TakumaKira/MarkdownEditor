import { storiesOf } from '@storybook/react-native'
import { StyleSheet, View, Text } from 'react-native'
import PreviewRenderer from '../../components/PreviewRenderer'
import TextWithCustomFont from '../../components/TextWithCustomFont'
import * as data from '../../data.json'
import colors from '../../theme/colors'
import textStyles from '../../theme/textStyles'

const styles = StyleSheet.create({
  blockCode: {
    padding: 24,
    backgroundColor: colors[200],
  },
  blockQuote: {
    padding: 24,
    backgroundColor: colors[200],
  },
  link: {
    textDecorationLine: 'underline',
  },
})

const Bullet = () => {
  return (<Text>・</Text>)
}

storiesOf('PreviewRenderer', module)
  .add('to Storybook', () =>
    <PreviewRenderer input={data[1].content} />
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
      <View style={{paddingLeft: 24}}>
        <TextWithCustomFont style={textStyles.previewParagraph}>1. Write markdown in the markdown editor window</TextWithCustomFont>
        <TextWithCustomFont style={[textStyles.previewParagraph, {marginTop: 4}]}>2. See the rendered markdown in the preview window</TextWithCustomFont>
      </View>
      <TextWithCustomFont style={textStyles.previewH3}>Features</TextWithCustomFont>
      <View style={{paddingLeft: 24}}>
        <TextWithCustomFont style={textStyles.previewParagraph}><Bullet />Create headings, paragraphs, links, blockquotes, inline-code, code blocks, and lists</TextWithCustomFont>
        <TextWithCustomFont style={[textStyles.previewParagraph, {marginTop: 4}]}><Bullet />Name and save the document to access again later</TextWithCustomFont>
        <TextWithCustomFont style={[textStyles.previewParagraph, {marginTop: 4}]}><Bullet />Choose between Light or Dark mode depending on your preference</TextWithCustomFont>
      </View>
      <View style={styles.blockQuote}>
        <TextWithCustomFont style={textStyles.previewParagraphBold}>This is an example of a blockquote. If you would like to learn more about markdown syntax, you can visit this <TextWithCustomFont style={styles.link} onPress={() => console.log('https://www.markdownguide.org/cheat-sheet/')}>markdown cheatsheet</TextWithCustomFont></TextWithCustomFont>
      </View>
      <TextWithCustomFont style={textStyles.previewH4}>Headings</TextWithCustomFont>
      <TextWithCustomFont style={textStyles.previewParagraph}>To create a heading, add the hash sign (#) before the heading. The number of number signs you use should correspond to the heading level. You'll see in this guide that we've used all six heading levels (not necessarily in the correct way you should use headings!) to illustrate how they should look.</TextWithCustomFont>
      <TextWithCustomFont style={textStyles.previewH5}>Lists</TextWithCustomFont>
      <TextWithCustomFont style={textStyles.previewParagraph}>You can see examples of ordered and unordered lists above.</TextWithCustomFont>
      <TextWithCustomFont style={textStyles.previewH6}>Code Blocks</TextWithCustomFont>
      <TextWithCustomFont style={textStyles.previewParagraph}>This markdown editor allows for inline-code snippets, like this: <TextWithCustomFont style={textStyles.markdownCode}>&lt;p&gt;I'm inline&lt;/p&gt;</TextWithCustomFont>. It also allows for larger code blocks like this:</TextWithCustomFont>
      <View style={styles.blockCode}>
        <TextWithCustomFont style={textStyles.markdownCode}>&lt;main&gt;</TextWithCustomFont>
        <TextWithCustomFont style={textStyles.markdownCode}>  &lt;h1&gt;This is a larger code block&lt;/h1&gt;</TextWithCustomFont>
        <TextWithCustomFont style={textStyles.markdownCode}>&lt;/main&gt;</TextWithCustomFont>
      </View>
    </View>
  )
