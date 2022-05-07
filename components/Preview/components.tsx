import * as WebBrowser from 'expo-web-browser'
import React from 'react'
import { StyleProp, TextStyle } from 'react-native'
import textStyles from '../../theme/textStyles'
import { Text } from '../common/withCustomFont'
import { splitByMarkdown } from './methods'

export const Bullet = () => {
  return (<Text>・</Text>)
}

export const Inline = {
  Code: (props: {children: string}) =>
    <Text style={textStyles.markdownCode}>
      {props.children}
    </Text>,
  Link: (props: {children: string | null, url: string | null}) =>
    <Text style={textStyles.link} onPress={() => WebBrowser.openBrowserAsync(props.url ?? '')}>
      {props.children}
    </Text>
} as const

export const LineRenderer = (props: {children: string, style?: StyleProp<TextStyle>}) => {
  const {
    children,
    style,
  } = props
  return (
    <Text style={style}>
      {splitByMarkdown(children).map((part, i) => {
        if (typeof part === 'string') {
          return part
        }
        return <React.Fragment key={i}>{part.renderFragment()}</React.Fragment>
      })}
    </Text>
  )
}
