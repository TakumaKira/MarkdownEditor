import { storiesOf } from "@storybook/react-native";
import React from "react";
import { Text } from '../../../components/common/withCustomFont';
import { Inline, LineRenderer } from "../../../components/Preview/components";
import textStyles from "../../../theme/textStyles";

storiesOf('Preview', module)
  .add('Inline.Code', () =>
    <Text style={textStyles.previewParagraph}>
      <Inline.Code>inline code</Inline.Code>
    </Text>
  )
  .add('Inline.Link', () =>
    <Text style={textStyles.previewParagraphBold}>
      <Inline.Link url="https://link.com">inline link</Inline.Link>
    </Text>
  )
  .add('LineRenderer', () =>
    <LineRenderer
      style={textStyles.previewParagraph}
    >
      {"this is `<p>inline code</p>` and click [this link](https://link.com)"}
    </LineRenderer>
  )
