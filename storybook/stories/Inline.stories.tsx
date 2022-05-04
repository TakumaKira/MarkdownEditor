import { storiesOf } from '@storybook/react-native'
import Inline from '../../components/Inline'
import TextWithCustomFont from '../../components/TextWithCustomFont'
import textStyles from '../../theme/textStyles'

storiesOf('Inline', module)
  .add('Code', () =>
    <TextWithCustomFont style={textStyles.previewParagraph}>
      <Inline.Code>inline code</Inline.Code>
    </TextWithCustomFont>
  )
  .add('Link', () =>
    <TextWithCustomFont style={textStyles.previewParagraphBold}>
      <Inline.Link url="https://link.com">inline link</Inline.Link>
    </TextWithCustomFont>
  )
