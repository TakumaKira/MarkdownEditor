import { action } from '@storybook/addon-actions';
import { boolean } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react-native';
import { StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';
import TopBar from '../../components/TopBar';
import { InputContextProvider } from '../../contexts/inputContext';
import themeColors from '../../theme/themeColors';
import getMockStore, { preloadedStateInDarkScheme } from '../mockStore/getMockStore';

const mockStore = getMockStore()
const mockStoreInDark = getMockStore(preloadedStateInDarkScheme)

const styles = StyleSheet.create({
  fullscreen: {
    height: '100%',
    width: '100%',
  },
})

storiesOf('TopBar', module)
  .add('in light scheme', () =>
    <Provider store={mockStore}>
      <InputContextProvider>
        <View style={[styles.fullscreen, themeColors['light'].editorBg]}>
          <TopBar showSidebar={boolean('show sidebar', false)} setShowSidebar={action('setShowSidebar')} />
        </View>
      </InputContextProvider>
    </Provider>
  )
  .add('in dark scheme', () =>
    <Provider store={mockStoreInDark}>
      <InputContextProvider>
        <View style={[styles.fullscreen, themeColors['dark'].editorBg]}>
          <TopBar showSidebar={boolean('show sidebar', false)} setShowSidebar={action('setShowSidebar')} />
        </View>
      </InputContextProvider>
    </Provider>
  )
