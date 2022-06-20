import { action } from '@storybook/addon-actions';
import { boolean } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';
import TopBar from '../../components/TopBar';
import { InputContextProvider } from '../../contexts/inputContext';
import themeColors from '../../theme/themeColors';
import getMockStore from '../utils/getMockStore';
import ThemeWrapper from '../utils/ThemeWrapper';

const mockStore = getMockStore()

const styles = StyleSheet.create({
  fullscreen: {
    height: '100%',
    width: '100%',
  },
})

storiesOf('TopBar', module)
  .add('to Storybook', () =>
    <Provider store={mockStore}>
      <InputContextProvider>
        <ThemeWrapper isDark={boolean('dark mode', false)}>
          {colorScheme =>
            <View style={[styles.fullscreen, themeColors[colorScheme].editorBg]}>
              <TopBar showSidebar={boolean('show sidebar', false)} setShowSidebar={action('setShowSidebar')} />
            </View>
          }
        </ThemeWrapper>
      </InputContextProvider>
    </Provider>
  )
