// This makes react-native-svg-transformer work on web.
// See https://github.com/kristerkari/react-native-svg-transformer/issues/70#issuecomment-633225746

import { Platform } from "react-native";

const SvgWrapper = (props: { children: JSX.Element }) => {
  if (Platform.OS === 'web') {
    return <img src={props.children.type} {...props.children.props} />
  }
  return props.children;
}

export default SvgWrapper