// This makes react-native-svg-transformer work on web.
// See https://github.com/kristerkari/react-native-svg-transformer/issues/70#issuecomment-633225746

import { Platform } from "react-native";

const SvgWrapper = (props: { children: JSX.Element }) => {
  const {children} = props
  if (Platform.OS === 'web') {
    return <img src={children.type} {...children.props} />
  }
  return children
}

export default SvgWrapper