import * as React from 'react';
import { ColorValue, StatusBar, StatusBarStyle, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CustomStatusBar = (props: {backgroundColor: ColorValue, barStyle?: StatusBarStyle}) => {
  const {
    backgroundColor,
    barStyle='dark-content'
  } = props

  const insets = useSafeAreaInsets()

  return (
    <View style={{ height: insets.top, backgroundColor }}>
      <StatusBar
        animated={true}
        backgroundColor={backgroundColor}
        barStyle={barStyle}
      />
    </View>
  );
}

export default CustomStatusBar