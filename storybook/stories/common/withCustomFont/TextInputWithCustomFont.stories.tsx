import { storiesOf } from '@storybook/react-native';
import { StyleSheet } from 'react-native';
import { TextInput } from '../../../../components/common/withCustomFont';
import textStyles from '../../../../theme/textStyles';

const styles = StyleSheet.create({
  input: {
    flex: 1,
  },
})

storiesOf('withCustomFont', module).add('TextInput', () =>
  <TextInput multiline style={[textStyles.markdownCode, styles.input]} />
);
