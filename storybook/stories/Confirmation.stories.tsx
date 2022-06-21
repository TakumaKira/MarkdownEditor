import { action } from '@storybook/addon-actions';
import { boolean, text } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';
import { Text } from '../../components/common/withCustomFont';
import Confirmation from '../../components/Confirmation';
import { confirmationMessages } from '../../constants/confirmationMessages';
import { ConfirmationState } from '../../contexts/inputContext';
import textStyles from '../../theme/textStyles';
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

const LONG_TITLE = 'Really really really very very very long long long title'
const LONG_TEXT = 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nostrum, labore similique? Ratione beatae totam nobis doloremque error esse aliquam molestias voluptatum perferendis. Dolorum accusantium blanditiis ducimus soluta, quibusdam et expedita!'

storiesOf('Confirmation', module)
  .add('Delete', () =>
    <Provider store={mockStore}>
      <ThemeWrapper isDark={boolean('dark mode', false)}>
        {colorScheme =>
          <View style={styles.fullscreen}>
            <View style={[styles.fullscreen, themeColors[colorScheme].editorBg]}>
              {[...Array(5).keys()].map((_, i) =>
                <Text key={i} style={[textStyles.markdownCode, themeColors[colorScheme].editorMarkdown]}>{LONG_TEXT}</Text>
              )}
            </View>
            {boolean('show', true) &&
              <Confirmation
                title={text('title', confirmationMessages[ConfirmationState.DELETE].title)}
                message={text('message', confirmationMessages[ConfirmationState.DELETE].message('Document Title.md'))}
                buttonLabel={text('button label', confirmationMessages[ConfirmationState.DELETE].buttonLabel).replace('&amp;', '&')}
                onPressButton={action('onPressButton')}
                onPressBackground={action('onPressBackground')}
              />
            }
          </View>
        }
      </ThemeWrapper>
    </Provider>
  )
  .add('Leaved unsaved document', () =>
    <Provider store={mockStore}>
      <ThemeWrapper isDark={boolean('dark mode', false)}>
        {colorScheme =>
          <View style={styles.fullscreen}>
            <View style={[styles.fullscreen, themeColors[colorScheme].editorBg]}>
              {[...Array(5).keys()].map((_, i) =>
                <Text key={i} style={[textStyles.markdownCode, themeColors[colorScheme].editorMarkdown]}>{LONG_TEXT}</Text>
              )}
            </View>
            {boolean('show', true) &&
              <Confirmation
                title={text('title', confirmationMessages[ConfirmationState.LEAVE_UNSAVED_DOCUMENT].title)}
                message={text('message', confirmationMessages[ConfirmationState.LEAVE_UNSAVED_DOCUMENT].message('Document Title.md'))}
                buttonLabel={text('button label', confirmationMessages[ConfirmationState.LEAVE_UNSAVED_DOCUMENT].buttonLabel).replace('&amp;', '&')}
                onPressButton={action('onPressButton')}
                onPressBackground={action('onPressBackground')}
              />
            }
          </View>
        }
      </ThemeWrapper>
    </Provider>
  )
  .add('Long text', () =>
    <Provider store={mockStore}>
      <ThemeWrapper isDark={boolean('dark mode', false)}>
        {colorScheme =>
          <View style={styles.fullscreen}>
            <View style={[styles.fullscreen, themeColors[colorScheme].editorBg]}>
              {[...Array(5).keys()].map((_, i) =>
                <Text key={i} style={[textStyles.markdownCode, themeColors[colorScheme].editorMarkdown]}>{LONG_TEXT}</Text>
              )}
            </View>
            {boolean('show', true) &&
              <Confirmation
                title={text('title', LONG_TITLE)}
                message={text('message', LONG_TEXT)}
                buttonLabel={text('button label', 'Click')}
                onPressButton={action('onPressButton')}
                onPressBackground={action('onPressBackground')}
              />
            }
          </View>
        }
      </ThemeWrapper>
    </Provider>
  )
