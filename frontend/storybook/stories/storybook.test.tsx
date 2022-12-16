import initStoryshots from '@storybook/addon-storyshots';
import ShallowRenderer from 'react-test-renderer/shallow';

// initStoryshots({ // TypeError: Cannot read properties of undefined (reading 'initializationPromise') -> TODO: Contribute to Storybook?(https://githubhot.com/repo/storybookjs/react-native/issues/323)
//   renderer: ShallowRenderer.createRenderer().render,
//   config: ({ configure }) =>
//     configure(() => {
//       require('./EditorView.stories.tsx')
//     }, module),
// })

xtest('this is dummy just to avoid extra failure message', () => {})
