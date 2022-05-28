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
    webVersionUrl: 'https://markdown-editor-git-master-takumakira.vercel.app/',
  },
}