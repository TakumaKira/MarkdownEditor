import { boolean, number } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react-native';
import { Provider } from 'react-redux';
import EditorView from '../../components/EditorView';
import { InputContextProvider } from '../../contexts/inputContext';
import getMockStore from '../mockStore/getMockStore';

const store = getMockStore()
const storeInDark = getMockStore({
  document: {
    documentList: [],
    selectedDocumentId: null,
  },
  theme: {
    deviceColorSchemeIsDark: true,
    selectedColorSchemeIsDark: true,
  },
})

storiesOf('EditorView', module)
  .add('in light scheme', () =>
    <Provider store={store}>
      <InputContextProvider>
        <EditorView maxHeight={boolean('enable max height', false) ? number('max height', 500) : undefined} />
      </InputContextProvider>
    </Provider>
  )
  .add('in dark scheme', () =>
    <Provider store={storeInDark}>
      <InputContextProvider>
        <EditorView maxHeight={boolean('enable max height', false) ? number('max height', 500) : undefined} />
      </InputContextProvider>
    </Provider>
  )
