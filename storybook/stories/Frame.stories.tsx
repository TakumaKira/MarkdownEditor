import { storiesOf } from '@storybook/react-native';
import { Provider } from 'react-redux';
import Frame from '../../components/Frame';
import MainView from '../../components/MainView';
import SafeArea from '../../components/SafeArea';
import SideBar from '../../components/SideBar';
import { InputContextProvider } from '../../contexts/inputContext';
import getMockStore, { preloadedStateInDarkScheme } from '../mockStore/getMockStore';

const mockStore = getMockStore()
const mockStoreInDark = getMockStore(preloadedStateInDarkScheme)

storiesOf('Frame', module)
  .add('in light scheme', () =>
    <Provider store={mockStore}>
      <InputContextProvider>
        <SafeArea>
          <Frame
            sidebar={SideBar}
            main={MainView}
          />
        </SafeArea>
      </InputContextProvider>
    </Provider>
  )
  .add('in dark scheme', () =>
    <Provider store={mockStoreInDark}>
      <InputContextProvider>
        <SafeArea>
          <Frame
            sidebar={SideBar}
            main={MainView}
          />
        </SafeArea>
      </InputContextProvider>
    </Provider>
  )
