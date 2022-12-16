import { number } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react-native';
import { StyleSheet, View } from 'react-native';
import LoadingCircles from '../../../components/common/LoadingCircles';
import colors from '../../../theme/colors';

const styles = StyleSheet.create({
  bg: {
    backgroundColor: colors.Orange,
  },
})

storiesOf('LoadingCircles', module)
  .addDecorator(story =>
    <View style={[styles.bg, {height: number('height', 100), width: number('width', 100)}]}>
      {story()}
    </View>
  )
  .add('to Storybook', () =>
    <LoadingCircles circleColorRGB="rgb(255, 255, 255)" />
  )
