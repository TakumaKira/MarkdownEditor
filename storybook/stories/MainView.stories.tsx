import { boolean } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react-native';
import { Provider } from 'react-redux';
import MainView from '../../components/MainView';
import { InputContextProvider } from '../../contexts/inputContext';
import getMockStore, { preloadedStateInDarkScheme } from '../mockStore/getMockStore';
import { action } from '@storybook/addon-actions';

const mockStore = getMockStore()
const mockStoreInDark = getMockStore(preloadedStateInDarkScheme)

storiesOf('MainView', module)
  .add('in light scheme', () =>
    <Provider store={mockStore}>
      <InputContextProvider>
        <MainView showSidebar={boolean('show sidebar', false)} setShowSidebar={action('setShowSidebar')} />
      </InputContextProvider>
    </Provider>
  )
  .add('in dark scheme', () =>
    <Provider store={mockStoreInDark}>
      <InputContextProvider>
        <MainView showSidebar={boolean('show sidebar', false)} setShowSidebar={action('setShowSidebar')} />
      </InputContextProvider>
    </Provider>
  )
