export default {
  name: 'Markdown Editor',
  version: '1.0.0',
  extra: {
    loadStorybook: process.env.LOAD_STORYBOOK === 'true',
    localIp: process.env.LOCAL_IP || '0.0.0.0',
    breakpoints: {
      MOBILE_TABLET: 600,
      TABLET_DESKTOP: 1200,
    },
    WEB_VERSION_URL: 'https://markdown-editor-git-master-takumakira.vercel.app/',
    NEW_DOCUMENT_TITLE: 'Untitled Document.md',
    INITIAL_DOCUMENTS: [
      {
        name: 'welcome.md',
        content: "# Welcome to Markdown\n\nMarkdown is a lightweight markup language that you can use to add formatting elements to plaintext text documents.\n\n## How to use this?\n\n1. Write markdown in the markdown editor window\n2. See the rendered markdown in the preview window\n\n### Features\n\n- Create headings, paragraphs, links, blockquotes, inline-code, code blocks, and lists\n- Name and save the document to access again later\n- Choose between Light or Dark mode depending on your preference\n\n> This is an example of a blockquote. If you would like to learn more about markdown syntax, you can visit this [markdown cheatsheet](https://www.markdownguide.org/cheat-sheet/).\n\n#### Headings\n\nTo create a heading, add the hash sign (#) before the heading. The number of number signs you use should correspond to the heading level. You'll see in this guide that we've used all six heading levels (not necessarily in the correct way you should use headings!) to illustrate how they should look.\n\n##### Lists\n\nYou can see examples of ordered and unordered lists above.\n\n###### Code Blocks\n\nThis markdown editor allows for inline-code snippets, like this: `<p>I'm inline</p>`. It also allows for larger code blocks like this:\n\n```\n<main>\n  <h1>This is a larger code block</h1>\n</main>\n```",
      },
    ],
    STATE_STORAGE_KEY: 'MARKDOWN_EDITOR_STATE',
  },
}