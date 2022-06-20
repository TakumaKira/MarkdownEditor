import { action } from '@storybook/addon-actions';
import { boolean } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';
import TopBar from '../../components/TopBar';
import { InputContextProvider } from '../../contexts/inputContext';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectColorScheme, toggleTheme } from '../../store/slices/theme';
import themeColors from '../../theme/themeColors';
import getMockStore from '../utils/getMockStore';

const mockStore = getMockStore()

const styles = StyleSheet.create({
  fullscreen: {
    height: '100%',
    width: '100%',
  },
})

const ThemeWrapper = (props: {children: JSX.Element, isDark: boolean}) => {
  const colorScheme = useAppSelector(selectColorScheme)
  const dispatch = useAppDispatch()
  React.useEffect(() => {
    if (
      (colorScheme === 'light' && props.isDark)
      || (colorScheme === 'dark' && !props.isDark)
    ) {
      dispatch(toggleTheme())
    }
  }, [props.isDark])
  return (
    <View style={[styles.fullscreen, themeColors[colorScheme].editorBg]}>
      {props.children}
    </View>
  )
}

storiesOf('TopBar', module)
  .add('to Storybook', () =>
    <Provider store={mockStore}>
      <InputContextProvider>
        <ThemeWrapper isDark={boolean('dark mode', false)}>
          <TopBar showSidebar={boolean('show sidebar', false)} setShowSidebar={action('setShowSidebar')} />
        </ThemeWrapper>
      </InputContextProvider>
    </Provider>
  )
