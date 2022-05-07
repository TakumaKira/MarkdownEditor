import { storiesOf } from '@storybook/react-native';
import { Text } from '../../../../components/common/withCustomFont';
import textStyles from '../../../../theme/textStyles';

storiesOf('withCustomFont', module).add('Text', () =>
  <Text style={textStyles.title}>Test</Text>
);
