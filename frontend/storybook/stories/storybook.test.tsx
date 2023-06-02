import initStoryshots from '@storybook/addon-storyshots';
import ShallowRenderer from 'react-test-renderer/shallow';

// initStoryshots({ // TypeError: Cannot read properties of undefined (reading 'initializationPromise') -> @see https://github.com/storybookjs/react-native/issues/323
//   renderer: ShallowRenderer.createRenderer().render,
//   config: ({ configure }) =>
//     configure(() => {
//       require('./EditorView.stories.tsx')
//     }, module),
// })

test('this is dummy just to avoid extra failure message', () => {})
