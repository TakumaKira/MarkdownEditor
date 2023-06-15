import { boolean } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react-native';
import React from 'react';
import { View } from 'react-native';
import { Provider } from 'react-redux';
import { DocumentConfirmationModal } from '../../components/MessageModal';
import getMockStore from '../utils/getMockStore';
import MockText from '../utils/MockText';
import utilStyles from '../utils/styles';
import ThemeWrapper from '../utils/ThemeWrapper';
import DocumentConfirmationStateTypes from '../../types/DocumentConfirmationStateTypes';

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
    <DocumentConfirmationModal
      confirmationState={{
        type: DocumentConfirmationStateTypes.DELETE
      }}
    />
  )
  .add('Leaved unsaved document', () =>
    <DocumentConfirmationModal
      confirmationState={{
        type: DocumentConfirmationStateTypes.LEAVE_UNSAVED_DOCUMENT,
        nextId: ''
      }}
    />
  )
