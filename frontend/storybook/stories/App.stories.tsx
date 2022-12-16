import { storiesOf } from '@storybook/react-native';
import React from 'react';
import App from '../../components/App';

storiesOf('App', module)
  .add('to Storybook', () =>
    <App />
  )
