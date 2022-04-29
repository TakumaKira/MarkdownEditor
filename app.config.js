export default {
  name: 'Markdown Editor',
  version: '1.0.0',
  extra: {
    loadStorybook: process.env.LOAD_STORYBOOK === 'true',
    localIp: process.env.LOCAL_IP,
  },
}