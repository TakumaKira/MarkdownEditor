import { number, select, text } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react-native';
import { Text } from '../../../../components/common/withCustomFont';
import fonts from '../../../../theme/fonts';

storiesOf('withCustomFont', module).add('Text', () =>
  <Text style={{
    fontFamily: select('font family', fonts, fonts.robotoLight),
    fontSize: number('font size', 128)
  }}>
    {text('text', 'text')}
  </Text>
)
