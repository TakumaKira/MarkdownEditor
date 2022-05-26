import React from 'react'
import { Animated, ScrollView, StyleProp, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View, ViewStyle } from 'react-native'
import DarkIconHighlight from '../assets/icon-dark-mode-highlight.svg'
import DarkIcon from '../assets/icon-dark-mode.svg'
import DocumentIcon from '../assets/icon-document.svg'
import LightIconHighlight from '../assets/icon-light-mode-highlight.svg'
import LightIcon from '../assets/icon-light-mode.svg'
import useMediaquery, { MediaType } from '../hooks/useMediaquery'
import colors from '../theme/colors'
import textStyles from '../theme/textStyles'
import SvgWrapper from './common/SvgWrapper'
import { Text } from './common/withCustomFont'
import Title from './Title'

export const SIDEBAR_WIDTH = 250

const styles = StyleSheet.create({
  container: {
    width: SIDEBAR_WIDTH,
    flex: 1,
    backgroundColor: colors[900],
    paddingLeft: 24,
    paddingRight: 24,
  },
  title: {
    marginTop: 27,
  },
  myDocuments: {
    color: colors[500],
    marginTop: 27,
  },
  addButton: {
    marginTop: 29,
    height: 40,
    backgroundColor: colors.Orange,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonLabel: {
    color: colors[100],
  },
  documentCardsContainer: {
    marginTop: 24,
    marginBottom: 24,
  },
  notFirstDocumentCard: {
    marginTop: 26,
  },
  documentCardContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  documentIcon: {
    top: 10,
  },
  documentCardTextsContainer: {
    marginLeft: 16,
  },
  createdAtLabel: {
    color: colors[500],
  },
  nameLabel: {
    marginTop: 3,
    color: colors[100],
    width: 170,
  },
  themeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  toggleSwitch: {
    width: 48,
    height: 24,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: colors[600],
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleSlider: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors[100],
  },
})

const data = [
  {
    "createdAt": "04-01-2022",
    "name": "untitled-document.md",
    "content": ""
  },
  {
    "createdAt": "04-01-2022",
    "name": "welcome.md",
    "content": "# Welcome to Markdown\n\nMarkdown is a lightweight markup language that you can use to add formatting elements to plaintext text documents.\n\n## How to use this?\n\n1. Write markdown in the markdown editor window\n2. See the rendered markdown in the preview window\n\n### Features\n\n- Create headings, paragraphs, links, blockquotes, inline-code, code blocks, and lists\n- Name and save the document to access again later\n- Choose between Light or Dark mode depending on your preference\n\n> This is an example of a blockquote. If you would like to learn more about markdown syntax, you can visit this [markdown cheatsheet](https://www.markdownguide.org/cheat-sheet/).\n\n#### Headings\n\nTo create a heading, add the hash sign (#) before the heading. The number of number signs you use should correspond to the heading level. You'll see in this guide that we've used all six heading levels (not necessarily in the correct way you should use headings!) to illustrate how they should look.\n\n##### Lists\n\nYou can see examples of ordered and unordered lists above.\n\n###### Code Blocks\n\nThis markdown editor allows for inline-code snippets, like this: `<p>I'm inline</p>`. It also allows for larger code blocks like this:\n\n```\n<main>\n  <h1>This is a larger code block</h1>\n</main>\n```"
  },
  {
    "createdAt": "04-01-2022",
    "name": "untitled-document-untitled-document-untitled-document-untitled-document-untitled-document-untitled-document-untitled-document-untitled-document-untitled-document-untitled-document-untitled-document.md",
    "content": ""
  },
  {
    "createdAt": "04-01-2022",
    "name": "welcome.md",
    "content": "# Welcome to Markdown\n\nMarkdown is a lightweight markup language that you can use to add formatting elements to plaintext text documents.\n\n## How to use this?\n\n1. Write markdown in the markdown editor window\n2. See the rendered markdown in the preview window\n\n### Features\n\n- Create headings, paragraphs, links, blockquotes, inline-code, code blocks, and lists\n- Name and save the document to access again later\n- Choose between Light or Dark mode depending on your preference\n\n> This is an example of a blockquote. If you would like to learn more about markdown syntax, you can visit this [markdown cheatsheet](https://www.markdownguide.org/cheat-sheet/).\n\n#### Headings\n\nTo create a heading, add the hash sign (#) before the heading. The number of number signs you use should correspond to the heading level. You'll see in this guide that we've used all six heading levels (not necessarily in the correct way you should use headings!) to illustrate how they should look.\n\n##### Lists\n\nYou can see examples of ordered and unordered lists above.\n\n###### Code Blocks\n\nThis markdown editor allows for inline-code snippets, like this: `<p>I'm inline</p>`. It also allows for larger code blocks like this:\n\n```\n<main>\n  <h1>This is a larger code block</h1>\n</main>\n```"
  },
  {
    "createdAt": "04-01-2022",
    "name": "untitled-document.md",
    "content": ""
  },
  {
    "createdAt": "04-01-2022",
    "name": "welcome.md",
    "content": "# Welcome to Markdown\n\nMarkdown is a lightweight markup language that you can use to add formatting elements to plaintext text documents.\n\n## How to use this?\n\n1. Write markdown in the markdown editor window\n2. See the rendered markdown in the preview window\n\n### Features\n\n- Create headings, paragraphs, links, blockquotes, inline-code, code blocks, and lists\n- Name and save the document to access again later\n- Choose between Light or Dark mode depending on your preference\n\n> This is an example of a blockquote. If you would like to learn more about markdown syntax, you can visit this [markdown cheatsheet](https://www.markdownguide.org/cheat-sheet/).\n\n#### Headings\n\nTo create a heading, add the hash sign (#) before the heading. The number of number signs you use should correspond to the heading level. You'll see in this guide that we've used all six heading levels (not necessarily in the correct way you should use headings!) to illustrate how they should look.\n\n##### Lists\n\nYou can see examples of ordered and unordered lists above.\n\n###### Code Blocks\n\nThis markdown editor allows for inline-code snippets, like this: `<p>I'm inline</p>`. It also allows for larger code blocks like this:\n\n```\n<main>\n  <h1>This is a larger code block</h1>\n</main>\n```"
  },
  {
    "createdAt": "04-01-2022",
    "name": "untitled-document.md",
    "content": ""
  },
  {
    "createdAt": "04-01-2022",
    "name": "welcome.md",
    "content": "# Welcome to Markdown\n\nMarkdown is a lightweight markup language that you can use to add formatting elements to plaintext text documents.\n\n## How to use this?\n\n1. Write markdown in the markdown editor window\n2. See the rendered markdown in the preview window\n\n### Features\n\n- Create headings, paragraphs, links, blockquotes, inline-code, code blocks, and lists\n- Name and save the document to access again later\n- Choose between Light or Dark mode depending on your preference\n\n> This is an example of a blockquote. If you would like to learn more about markdown syntax, you can visit this [markdown cheatsheet](https://www.markdownguide.org/cheat-sheet/).\n\n#### Headings\n\nTo create a heading, add the hash sign (#) before the heading. The number of number signs you use should correspond to the heading level. You'll see in this guide that we've used all six heading levels (not necessarily in the correct way you should use headings!) to illustrate how they should look.\n\n##### Lists\n\nYou can see examples of ordered and unordered lists above.\n\n###### Code Blocks\n\nThis markdown editor allows for inline-code snippets, like this: `<p>I'm inline</p>`. It also allows for larger code blocks like this:\n\n```\n<main>\n  <h1>This is a larger code block</h1>\n</main>\n```"
  },
  {
    "createdAt": "04-01-2022",
    "name": "untitled-document.md",
    "content": ""
  },
  {
    "createdAt": "04-01-2022",
    "name": "welcome.md",
    "content": "# Welcome to Markdown\n\nMarkdown is a lightweight markup language that you can use to add formatting elements to plaintext text documents.\n\n## How to use this?\n\n1. Write markdown in the markdown editor window\n2. See the rendered markdown in the preview window\n\n### Features\n\n- Create headings, paragraphs, links, blockquotes, inline-code, code blocks, and lists\n- Name and save the document to access again later\n- Choose between Light or Dark mode depending on your preference\n\n> This is an example of a blockquote. If you would like to learn more about markdown syntax, you can visit this [markdown cheatsheet](https://www.markdownguide.org/cheat-sheet/).\n\n#### Headings\n\nTo create a heading, add the hash sign (#) before the heading. The number of number signs you use should correspond to the heading level. You'll see in this guide that we've used all six heading levels (not necessarily in the correct way you should use headings!) to illustrate how they should look.\n\n##### Lists\n\nYou can see examples of ordered and unordered lists above.\n\n###### Code Blocks\n\nThis markdown editor allows for inline-code snippets, like this: `<p>I'm inline</p>`. It also allows for larger code blocks like this:\n\n```\n<main>\n  <h1>This is a larger code block</h1>\n</main>\n```"
  },
  {
    "createdAt": "04-01-2022",
    "name": "untitled-document.md",
    "content": ""
  },
  {
    "createdAt": "04-01-2022",
    "name": "welcome.md",
    "content": "# Welcome to Markdown\n\nMarkdown is a lightweight markup language that you can use to add formatting elements to plaintext text documents.\n\n## How to use this?\n\n1. Write markdown in the markdown editor window\n2. See the rendered markdown in the preview window\n\n### Features\n\n- Create headings, paragraphs, links, blockquotes, inline-code, code blocks, and lists\n- Name and save the document to access again later\n- Choose between Light or Dark mode depending on your preference\n\n> This is an example of a blockquote. If you would like to learn more about markdown syntax, you can visit this [markdown cheatsheet](https://www.markdownguide.org/cheat-sheet/).\n\n#### Headings\n\nTo create a heading, add the hash sign (#) before the heading. The number of number signs you use should correspond to the heading level. You'll see in this guide that we've used all six heading levels (not necessarily in the correct way you should use headings!) to illustrate how they should look.\n\n##### Lists\n\nYou can see examples of ordered and unordered lists above.\n\n###### Code Blocks\n\nThis markdown editor allows for inline-code snippets, like this: `<p>I'm inline</p>`. It also allows for larger code blocks like this:\n\n```\n<main>\n  <h1>This is a larger code block</h1>\n</main>\n```"
  },
  {
    "createdAt": "04-01-2022",
    "name": "untitled-document.md",
    "content": ""
  },
  {
    "createdAt": "04-01-2022",
    "name": "welcome.md",
    "content": "# Welcome to Markdown\n\nMarkdown is a lightweight markup language that you can use to add formatting elements to plaintext text documents.\n\n## How to use this?\n\n1. Write markdown in the markdown editor window\n2. See the rendered markdown in the preview window\n\n### Features\n\n- Create headings, paragraphs, links, blockquotes, inline-code, code blocks, and lists\n- Name and save the document to access again later\n- Choose between Light or Dark mode depending on your preference\n\n> This is an example of a blockquote. If you would like to learn more about markdown syntax, you can visit this [markdown cheatsheet](https://www.markdownguide.org/cheat-sheet/).\n\n#### Headings\n\nTo create a heading, add the hash sign (#) before the heading. The number of number signs you use should correspond to the heading level. You'll see in this guide that we've used all six heading levels (not necessarily in the correct way you should use headings!) to illustrate how they should look.\n\n##### Lists\n\nYou can see examples of ordered and unordered lists above.\n\n###### Code Blocks\n\nThis markdown editor allows for inline-code snippets, like this: `<p>I'm inline</p>`. It also allows for larger code blocks like this:\n\n```\n<main>\n  <h1>This is a larger code block</h1>\n</main>\n```"
  },
  {
    "createdAt": "04-01-2022",
    "name": "untitled-document.md",
    "content": ""
  },
  {
    "createdAt": "04-01-2022",
    "name": "welcome.md",
    "content": "# Welcome to Markdown\n\nMarkdown is a lightweight markup language that you can use to add formatting elements to plaintext text documents.\n\n## How to use this?\n\n1. Write markdown in the markdown editor window\n2. See the rendered markdown in the preview window\n\n### Features\n\n- Create headings, paragraphs, links, blockquotes, inline-code, code blocks, and lists\n- Name and save the document to access again later\n- Choose between Light or Dark mode depending on your preference\n\n> This is an example of a blockquote. If you would like to learn more about markdown syntax, you can visit this [markdown cheatsheet](https://www.markdownguide.org/cheat-sheet/).\n\n#### Headings\n\nTo create a heading, add the hash sign (#) before the heading. The number of number signs you use should correspond to the heading level. You'll see in this guide that we've used all six heading levels (not necessarily in the correct way you should use headings!) to illustrate how they should look.\n\n##### Lists\n\nYou can see examples of ordered and unordered lists above.\n\n###### Code Blocks\n\nThis markdown editor allows for inline-code snippets, like this: `<p>I'm inline</p>`. It also allows for larger code blocks like this:\n\n```\n<main>\n  <h1>This is a larger code block</h1>\n</main>\n```"
  },
  {
    "createdAt": "04-01-2022",
    "name": "untitled-document.md",
    "content": ""
  },
  {
    "createdAt": "04-01-2022",
    "name": "welcome.md",
    "content": "# Welcome to Markdown\n\nMarkdown is a lightweight markup language that you can use to add formatting elements to plaintext text documents.\n\n## How to use this?\n\n1. Write markdown in the markdown editor window\n2. See the rendered markdown in the preview window\n\n### Features\n\n- Create headings, paragraphs, links, blockquotes, inline-code, code blocks, and lists\n- Name and save the document to access again later\n- Choose between Light or Dark mode depending on your preference\n\n> This is an example of a blockquote. If you would like to learn more about markdown syntax, you can visit this [markdown cheatsheet](https://www.markdownguide.org/cheat-sheet/).\n\n#### Headings\n\nTo create a heading, add the hash sign (#) before the heading. The number of number signs you use should correspond to the heading level. You'll see in this guide that we've used all six heading levels (not necessarily in the correct way you should use headings!) to illustrate how they should look.\n\n##### Lists\n\nYou can see examples of ordered and unordered lists above.\n\n###### Code Blocks\n\nThis markdown editor allows for inline-code snippets, like this: `<p>I'm inline</p>`. It also allows for larger code blocks like this:\n\n```\n<main>\n  <h1>This is a larger code block</h1>\n</main>\n```"
  },
  {
    "createdAt": "04-01-2022",
    "name": "untitled-document.md",
    "content": ""
  },
  {
    "createdAt": "04-01-2022",
    "name": "welcome.md",
    "content": "# Welcome to Markdown\n\nMarkdown is a lightweight markup language that you can use to add formatting elements to plaintext text documents.\n\n## How to use this?\n\n1. Write markdown in the markdown editor window\n2. See the rendered markdown in the preview window\n\n### Features\n\n- Create headings, paragraphs, links, blockquotes, inline-code, code blocks, and lists\n- Name and save the document to access again later\n- Choose between Light or Dark mode depending on your preference\n\n> This is an example of a blockquote. If you would like to learn more about markdown syntax, you can visit this [markdown cheatsheet](https://www.markdownguide.org/cheat-sheet/).\n\n#### Headings\n\nTo create a heading, add the hash sign (#) before the heading. The number of number signs you use should correspond to the heading level. You'll see in this guide that we've used all six heading levels (not necessarily in the correct way you should use headings!) to illustrate how they should look.\n\n##### Lists\n\nYou can see examples of ordered and unordered lists above.\n\n###### Code Blocks\n\nThis markdown editor allows for inline-code snippets, like this: `<p>I'm inline</p>`. It also allows for larger code blocks like this:\n\n```\n<main>\n  <h1>This is a larger code block</h1>\n</main>\n```"
  },
]

const SideBar = () => {
  const mediaType = useMediaquery()

  return (
    <View style={styles.container}>
      {mediaType !== MediaType.DESKTOP && <Title style={styles.title} />}
      <Text style={[styles.myDocuments, textStyles.headingS]}>MY DOCUMENTS</Text>
      <AddButton onPress={() => console.log('New document')} />
      <ScrollView style={styles.documentCardsContainer}>
        {data.map(({createdAt, name}, i) =>
          <DocumentCard
            key={i}
            createdAt={createdAt}
            name={name}
            style={i === 0 ? undefined : styles.notFirstDocumentCard}
            onPress={() => console.log(i)}
          />
        )}
      </ScrollView>
      <ThemeToggle initialIsDark={false} />
    </View>
  )
}

const AddButton = (props: {onPress: () => void}) => {
  const {
    onPress,
  } = props

  return (
    <TouchableOpacity onPress={onPress} style={styles.addButton}>
      <Text style={[styles.addButtonLabel, textStyles.headingM]}>+ New Document</Text>
    </TouchableOpacity>
  )
}

const DocumentCard = (props: {createdAt: string, name: string, style?: StyleProp<ViewStyle>, onPress: () => void}) => {
  const {
    createdAt,
    name,
    style,
    onPress,
  } = props

  return (
    <TouchableOpacity style={[styles.documentCardContainer, style]} onPress={onPress}>
      <View style={styles.documentIcon}>
        <SvgWrapper>
          <DocumentIcon />
        </SvgWrapper>
      </View>
      <View style={styles.documentCardTextsContainer}>
        <Text style={[styles.createdAtLabel, textStyles.bodyM]}>{formatDate(createdAt)}</Text>
        <Text style={[styles.nameLabel, textStyles.headingM]}>{name}</Text>
      </View>
    </TouchableOpacity>
  )
}

/** Format date string from "04-01-2022" to "01 April 2022" */
const formatDate = (createdAt: string): string => {
  try {
    const [monthStr, dayStr, yearStr] = createdAt.split('-')
    const months: Record<string, string> = {
      '01': 'January', '02': 'February', '03': 'March', '04': 'April', '05': 'May', '06': 'June', '07': 'July', '08': 'August', '09': 'September', '10': 'October', '11': 'November', '12': 'December'
    } as const
    return `${dayStr} ${months[monthStr]} ${yearStr}`
  } catch {
    return createdAt
  }
}

const ThemeToggle = (props: {initialIsDark: boolean}) => {
  const {
    initialIsDark,
  } = props

  const [isDark, setIsDark] = React.useState<boolean>(initialIsDark)

  return (
    <View style={styles.themeToggleContainer}>
      <SvgWrapper>
       {isDark ? <DarkIconHighlight /> : <DarkIcon />}
      </SvgWrapper>
      <ToggleSwitch initialIsLeft={isDark} isLeft={isDark} setIsLeft={setIsDark} />
      <SvgWrapper>
        {isDark ? <LightIcon /> : <LightIconHighlight />}
      </SvgWrapper>
    </View>
  )
}

const ANIM_DURATION = 200
const IS_LEFT_MARGIN_LEFT = 6
const IS_RIGHT_MARGIN_LEFT = 30

const ToggleSwitch = (props: {initialIsLeft: boolean, isLeft: boolean, setIsLeft: React.Dispatch<React.SetStateAction<boolean>>}) => {
  const {
    initialIsLeft,
    isLeft,
    setIsLeft,
  } = props

  const marginLeftAnim = React.useRef(new Animated.Value(initialIsLeft ? IS_LEFT_MARGIN_LEFT : IS_RIGHT_MARGIN_LEFT)).current

  React.useEffect(() => {
    isLeft ? toLeftAnim() : toRightAnim()
  }, [isLeft])

  const toLeftAnim = () => {
    Animated.timing(marginLeftAnim, {
      toValue: IS_LEFT_MARGIN_LEFT,
      duration: ANIM_DURATION,
      useNativeDriver: false
    }).start()
  }
  const toRightAnim = () => {
    Animated.timing(marginLeftAnim, {
      toValue: IS_RIGHT_MARGIN_LEFT,
      duration: ANIM_DURATION,
      useNativeDriver: false
    }).start()
  }

  return (
    <TouchableWithoutFeedback onPress={() => setIsLeft(isLeft => !isLeft)}>
      <View style={styles.toggleSwitch}>
        <Animated.View style={[styles.toggleSlider, {marginLeft: marginLeftAnim}]} />
      </View>
    </TouchableWithoutFeedback>
  )
}

export default SideBar
