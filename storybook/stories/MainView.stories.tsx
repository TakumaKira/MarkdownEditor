import { storiesOf } from '@storybook/react-native';
import MainView from '../../components/MainView';

storiesOf('MainView', module).add('to Storybook', () =>
  <MainView setShowSidebar={() => {}} />
);
