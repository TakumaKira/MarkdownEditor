import { View } from 'react-native';
import { Text } from '../../components/common/withCustomFont';
import textStyles from '../../theme/textStyles';
import themeColors from '../../theme/themeColors';
import { LONG_TEXT } from './constants';
import utilStyles from './styles';

const MockText = (props: {colorScheme: "light" | "dark"}) => {
  const {colorScheme} = props
  return (
    <View style={[utilStyles.fullscreen, themeColors[colorScheme].editorBg]}>
      {[...Array(5).keys()].map((_, i) =>
        <Text key={i} style={[textStyles.markdownCode, themeColors[colorScheme].editorMarkdown]}>{LONG_TEXT}</Text>
      )}
    </View>
  )
}
export default MockText
