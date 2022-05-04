import * as WebBrowser from 'expo-web-browser'
import textStyles from '../theme/textStyles'
import TextWithCustomFont from './TextWithCustomFont'

const Inline = {
  Code: (props: {children: string}) =>
    <TextWithCustomFont style={textStyles.markdownCode}>
      {props.children}
    </TextWithCustomFont>,
  Link: (props: {children: string, url: string}) =>
    <TextWithCustomFont style={textStyles.link} onPress={() => WebBrowser.openBrowserAsync(props.url)}>
      {props.children}
    </TextWithCustomFont>
}

export default Inline