import { boolean, color, number, select, text } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react-native';
import React from 'react';
import ButtonWithHoverColorAnimation from '../../../components/common/ButtonWithHoverColorAnimation';
import SvgWrapper from '../../../components/common/SvgWrapper';
import { action } from '@storybook/addon-actions'
import { StyleSheet, View } from 'react-native';
import { Text } from '../../../components/common/withCustomFont';
import fonts from '../../../theme/fonts';
import SaveIcon from '../../../assets/icon-save.svg'
import colors from '../../../theme/colors';

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  button: {
    height: 40,
    paddingLeft: 16,
    paddingRight: 16,
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
})

storiesOf('ButtonWithHover', module)
  .add('to Storybook', () => {
    const showSaveIcon = boolean('show save icon', true)
    return (
      <View style={styles.container}>
        <ButtonWithHoverColorAnimation onPress={action('onPress')} offBgColorRGB={text('offColorRGB', colors.Orange as string)} onBgColorRGB={text('onColorRGB', colors.OrangeHover as string)} duration={number('duration', 100)} style={styles.button}>
          {showSaveIcon &&
            <SvgWrapper>
              <SaveIcon />
            </SvgWrapper>
          }
          {boolean('show text', true) &&
            <Text style={{
              fontFamily: select('font family', fonts, fonts.robotoRegular),
              fontSize: number('font size', 15),
              color: text('label color', colors[100] as string),
              marginLeft: showSaveIcon ? 8 : 0
            }}>
              {text('label', 'Save Changes')}
            </Text>
          }
        </ButtonWithHoverColorAnimation>
      </View>
    )
  })
