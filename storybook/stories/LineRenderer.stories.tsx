import { storiesOf } from '@storybook/react-native';
import LineRenderer from '../../components/LineRenderer';
import textStyles from '../../theme/textStyles';

storiesOf('LineRenderer', module).add('to Storybook', () =>
  <LineRenderer
    style={textStyles.previewParagraph}
  >
    {"this is `<p>inline code</p>` and click [this link](https://link.com)"}
  </LineRenderer>
)
