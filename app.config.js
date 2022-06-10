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
  },
}