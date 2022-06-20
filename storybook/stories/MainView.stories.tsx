import { action } from '@storybook/addon-actions';
import { boolean } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react-native';
import React from 'react';
import { Provider } from 'react-redux';
import MainView from '../../components/MainView';
import { InputContextProvider } from '../../contexts/inputContext';
import getMockStore from '../utils/getMockStore';
import ThemeWrapper from '../utils/ThemeWrapper';

const mockStore = getMockStore()

storiesOf('MainView', module)
  .add('to Storybook', () =>
    <Provider store={mockStore}>
      <InputContextProvider>
        <ThemeWrapper isDark={boolean('dark mode', false)}>
          <MainView showSidebar={boolean('show sidebar', false)} setShowSidebar={action('setShowSidebar')} />
        </ThemeWrapper>
      </InputContextProvider>
    </Provider>
  )
