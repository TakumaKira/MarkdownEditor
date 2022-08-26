import { action } from '@storybook/addon-actions';
import { boolean, number } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react-native';
import React from 'react';
import { View } from 'react-native';
import { Provider } from 'react-redux';
import TopBar from '../../components/TopBar';
import themeColors from '../../theme/themeColors';
import getMockStore from '../utils/getMockStore';
import utilStyles from '../utils/styles';
import ThemeWrapper from '../utils/ThemeWrapper';

const mockStore = getMockStore()

storiesOf('TopBar', module)
  .add('to Storybook', () =>
    <Provider store={mockStore}>
      <ThemeWrapper isDark={boolean('dark mode', false)}>
        {colorScheme => {
          const mockWindowWidth = boolean('check layout', false, 'checkLayout') ? number('width', 500, {range: true, min: 200, max: 2000, step: 1}, 'checkLayout') : undefined
          return (
            <View style={[
              utilStyles.fullscreen,
              themeColors[colorScheme].editorBg,
              {width: mockWindowWidth},
            ]}>
              <TopBar
                showSidebar={boolean('show sidebar', false)}
                setShowSidebar={action('setShowSidebar')}
                checkLayout={boolean('check layout', false, 'checkLayout')}
                mockWindowWidth={mockWindowWidth}
              />
            </View>
          )
        }}
      </ThemeWrapper>
    </Provider>
  )
