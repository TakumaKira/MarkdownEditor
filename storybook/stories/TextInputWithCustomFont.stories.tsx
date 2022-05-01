import { storiesOf } from '@storybook/react-native';
import { StyleSheet } from 'react-native';
import TextInputWithCustomFont from '../../components/TextInputWithCustomFont';
import textStyles from '../../theme/textStyles';

const styles = StyleSheet.create({
  input: {
    flex: 1,
  },
})

storiesOf('TextInputWithCustomFont', module).add('to Storybook', () =>
  <TextInputWithCustomFont multiline style={[textStyles.markdownCode, styles.input]} />
);
