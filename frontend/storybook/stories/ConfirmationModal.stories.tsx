import { action } from '@storybook/addon-actions';
import { boolean, text } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react-native';
import React from 'react';
import { View } from 'react-native';
import { Provider } from 'react-redux';
import ConfirmationModal from '../../components/ConfirmationModal';
import { confirmationMessages, ConfirmationStateTypes } from '../../constants/confirmationMessages';
import { LONG_TEXT, LONG_TITLE } from '../utils/constants';
import getMockStore from '../utils/getMockStore';
import MockText from '../utils/MockText';
import utilStyles from '../utils/styles';
import ThemeWrapper from '../utils/ThemeWrapper';

const mockStore = getMockStore()

storiesOf('ConfirmationModal', module)
  .addDecorator(story =>
    <Provider store={mockStore}>
      <ThemeWrapper isDark={boolean('dark mode', false)}>
        {colorScheme =>
          <View style={utilStyles.fullscreen}>
            <MockText colorScheme={colorScheme} />
            {boolean('show', true) &&
              <>{story()}</>
            }
          </View>
        }
      </ThemeWrapper>
    </Provider>
  )
  .add('Delete', () =>
    <ConfirmationModal
      confirmationState={{
        type: ConfirmationStateTypes.DELETE
      }}
    />
  )
  .add('Leaved unsaved document', () =>
    <ConfirmationModal
      confirmationState={{
        type: ConfirmationStateTypes.LEAVE_UNSAVED_DOCUMENT,
        nextId: ''
      }}
    />
  )
