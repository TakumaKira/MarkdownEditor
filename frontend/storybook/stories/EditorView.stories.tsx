import { boolean, number } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react-native';
import { Provider } from 'react-redux';
import EditorView from '../../components/EditorView';
import getMockStore from '../utils/getMockStore';
import ThemeWrapper from '../utils/ThemeWrapper';

const mockStore = getMockStore()

storiesOf('EditorView', module)
  .add('to Storybook', () =>
    <Provider store={mockStore}>
      <ThemeWrapper isDark={boolean('dark mode', false)}>
        {colorScheme =>
          <EditorView maxHeight={boolean('enable max height', false) ? number('max height', 500) : undefined} />
        }
      </ThemeWrapper>
    </Provider>
  )
