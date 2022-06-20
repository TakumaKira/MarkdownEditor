import { boolean, number } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react-native';
import { Provider } from 'react-redux';
import EditorView from '../../components/EditorView';
import { InputContextProvider } from '../../contexts/inputContext';
import getMockStore from '../utils/getMockStore';
import ThemeWrapper from '../utils/ThemeWrapper';

const mockStore = getMockStore()

storiesOf('EditorView', module)
  .add('to Storybook', () =>
    <Provider store={mockStore}>
      <InputContextProvider>
        <ThemeWrapper isDark={boolean('dark mode', false)}>
          <EditorView maxHeight={boolean('enable max height', false) ? number('max height', 500) : undefined} />
        </ThemeWrapper>
      </InputContextProvider>
    </Provider>
  )
