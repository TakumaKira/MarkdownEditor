import { boolean, number } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react-native';
import { Provider } from 'react-redux';
import EditorView from '../../components/EditorView';
import { InputContextProvider } from '../../contexts/inputContext';
import getMockStore, { preloadedStateInDarkScheme } from '../mockStore/getMockStore';

const mockStore = getMockStore()
const mockStoreInDark = getMockStore(preloadedStateInDarkScheme)

storiesOf('EditorView', module)
  .add('in light scheme', () =>
    <Provider store={mockStore}>
      <InputContextProvider>
        <EditorView maxHeight={boolean('enable max height', false) ? number('max height', 500) : undefined} />
      </InputContextProvider>
    </Provider>
  )
  .add('in dark scheme', () =>
    <Provider store={mockStoreInDark}>
      <InputContextProvider>
        <EditorView maxHeight={boolean('enable max height', false) ? number('max height', 500) : undefined} />
      </InputContextProvider>
    </Provider>
  )
