import { number, select } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react-native';
import { StyleSheet } from 'react-native';
import { TextInput } from '../../../../components/common/withCustomFont';
import fonts from '../../../../theme/fonts';

const styles = StyleSheet.create({
  input: {
    flex: 1,
  },
})

storiesOf('withCustomFont', module)
  .add('TextInput', () =>
    <TextInput
      style={[styles.input, {
        fontFamily: select('font family', fonts, fonts.robotoLight),
        fontSize: number('font size', 96)
      }]}
      multiline placeholder="Input something..."
    />
  )
