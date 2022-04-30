import { storiesOf } from '@storybook/react-native';
import Frame from '../../components/Frame';
import MainView from '../../components/MainView';
import SideBar from '../../components/SideBar';

storiesOf('Frame', module).add('to Storybook', () =>
  <Frame
    sideBar={SideBar}
    main={MainView}
  />
);
