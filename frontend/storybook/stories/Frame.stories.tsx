import { storiesOf } from '@storybook/react-native';
import { Provider } from 'react-redux';
import Frame from '../../components/Frame';
import MainView from '../../components/MainView';
import SafeArea from '../../components/SafeArea';
import SideBar from '../../components/SideBar';
import getMockStore from '../utils/getMockStore';

const mockStore = getMockStore()

storiesOf('Frame', module)
  .add('to Storybook', () =>
    <Provider store={mockStore}>
      <SafeArea>
        <Frame
          sidebar={SideBar}
          main={MainView}
        />
      </SafeArea>
    </Provider>
  )
