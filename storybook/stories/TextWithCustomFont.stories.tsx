import { storiesOf } from '@storybook/react-native';
import TextWithCustomFont from '../../components/TextWithCustomFont';
import textStyles from '../../theme/textStyles';

storiesOf('TextWithCustomFont', module).add('to Storybook', () =>
  <TextWithCustomFont style={textStyles.title}>Test</TextWithCustomFont>
);
